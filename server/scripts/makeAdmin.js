require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

const nameOrEmail = process.argv[2];

if (!nameOrEmail) {
  console.error('Usage: node scripts/makeAdmin.js <name-or-email>');
  console.error('Example: node scripts/makeAdmin.js rahul');
  console.error('Example: node scripts/makeAdmin.js rahul@email.com');
  process.exit(1);
}

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('[DB] Connected');

    const isEmail = nameOrEmail.includes('@');
    const query = isEmail
      ? { email: nameOrEmail.toLowerCase() }
      : { name: { $regex: nameOrEmail, $options: 'i' } };

    const user = await User.findOne(query);

    if (!user) {
      console.error(`[Error] No user found matching "${nameOrEmail}"`);
      process.exit(1);
    }

    if (user.role === 'admin') {
      console.log(`[Info] "${user.name}" (${user.email}) is already an admin.`);
      process.exit(0);
    }

    user.role = 'admin';
    await user.save();

    console.log(`[Success] "${user.name}" (${user.email}) has been promoted to admin.`);
    console.log('[Next] Log out and log back in to get a fresh token with admin role.');
  } catch (err) {
    console.error('[Error]', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
})();
