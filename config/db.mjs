import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

let sqz;

if (process.env.DATABASE_URL) {
  sqz = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  });
} else {
  sqz = new Sequelize(
    process.env.DB_NAME || 'g24sec',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || 'Perseus.2025',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    }
  );
}

export default sqz;

