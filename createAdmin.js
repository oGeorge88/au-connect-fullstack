require('dotenv').config(); // Load environment variables
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const User = require('./models/User');  // Adjust the path to your User model

const createAdminUser = async () => {
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const existingAdmin = await User.findOne({ username: 'admin' });
  if (existingAdmin) {
    console.log('Admin user already exists');
    return;
  }

  const hashedPassword = await bcrypt.hash('admin123', 10);
  const adminUser = new User({
    displayName: 'Admin',
    username: 'admin',
    email: 'admin@example.com',  // You can set any email here
    password: hashedPassword,
    role: 'admin',
  });

  await adminUser.save();
  console.log('Admin user created successfully');
};

createAdminUser()
  .catch((error) => {
    console.error('Error creating admin user:', error);
  })
  .finally(() => {
    mongoose.connection.close();
  });
