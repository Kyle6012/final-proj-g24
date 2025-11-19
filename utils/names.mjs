import User from '../models/User.mjs'; 


export const generateUniqueUsername = async (firstName, lastName) => {
  const baseUsername = (firstName + lastName).replace(/\s+/g, '').toLowerCase();
  let username = baseUsername;
  let suffix = 1;

  let userExists = await User.findOne({ where: { username } });

  while (userExists) {
    username = `${baseUsername}${suffix}`;
    suffix++;
    userExists = await User.findOne({ where: { username } });
  }
  return username;
}
