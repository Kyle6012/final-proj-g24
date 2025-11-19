import sqz from '../config/db.mjs';
import { QueryTypes } from 'sequelize';

// This migration adds a trigger to automatically populate the userId field with the value from userLikeId
// This allows the frontend to continue working without changes while fixing the backend issue

async function runMigration() {
  try {
    console.log('Starting likes table migration...');
    
    // Check if the userId column exists
    const columns = await sqz.query(
      `SELECT column_name FROM information_schema.columns 
       WHERE table_name = 'Likes' AND column_name = 'userId'`,
      { type: QueryTypes.SELECT }
    );
    
    if (columns.length === 0) {
      // Add userId column if it doesn't exist
      console.log('Adding userId column to Likes table...');
      await sqz.query(
        `ALTER TABLE "Likes" ADD COLUMN "userId" UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'`
      );
    }
    
    // Create trigger to automatically copy userLikeId to userId
    console.log('Creating trigger to sync userLikeId to userId...');
    await sqz.query(`
      CREATE OR REPLACE FUNCTION sync_user_like_id_to_user_id()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW."userId" = NEW."userLikeId";
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    
    // Check if trigger exists
    const triggerExists = await sqz.query(
      `SELECT 1 FROM pg_trigger WHERE tgname = 'sync_user_like_id_trigger'`,
      { type: QueryTypes.SELECT }
    );
    
    if (triggerExists.length === 0) {
      await sqz.query(`
        CREATE TRIGGER sync_user_like_id_trigger
        BEFORE INSERT OR UPDATE ON "Likes"
        FOR EACH ROW
        EXECUTE FUNCTION sync_user_like_id_to_user_id();
      `);
    }
    
    // Update existing records to set userId = userLikeId
    console.log('Updating existing records...');
    await sqz.query(`
      UPDATE "Likes" SET "userId" = "userLikeId" WHERE "userId" IS NULL OR "userId" = '00000000-0000-0000-0000-000000000000'
    `);
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

// Run the migration
runMigration();
