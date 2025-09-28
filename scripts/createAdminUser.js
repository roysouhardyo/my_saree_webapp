const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB connection string - adjust if needed
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/saree-not-sorry';

// User Schema (simplified version for this script)
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  passwordHash: {
    type: String,
    required: function() {
      return this.provider === 'credentials';
    },
  },
  role: {
    type: String,
    enum: ['customer', 'vendor', 'admin'],
    default: 'customer',
  },
  provider: {
    type: String,
    enum: ['google', 'credentials'],
    required: true,
  },
  addresses: [{
    type: {
      type: String,
      enum: ['home', 'work', 'other'],
      default: 'home',
    },
    name: String,
    phone: String,
    address: String,
    city: String,
    state: String,
    pincode: String,
    isDefault: {
      type: Boolean,
      default: false,
    },
  }],
  notifications: [{
    type: {
      type: String,
      enum: ['order_status', 'order_cancelled', 'order_confirmed', 'order_shipped', 'order_delivered'],
    },
    title: String,
    message: String,
    orderId: String,
    orderNumber: String,
    read: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
}, {
  timestamps: true,
});

const User = mongoose.model('User', UserSchema);

async function createAdminUser() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully');

    // Check if user already exists
    const existingUser = await User.findOne({ email: 'test5@gmail.com' });
    if (existingUser) {
      console.log('User with email test5@gmail.com already exists');
      console.log('Updating existing user to admin role...');
      
      // Update existing user
      const hashedPassword = await bcrypt.hash('123456Aa@', 12);
      existingUser.passwordHash = hashedPassword;
      existingUser.role = 'admin';
      existingUser.provider = 'credentials';
      existingUser.name = 'Admin User';
      
      await existingUser.save();
      console.log('✅ Existing user updated successfully with admin role');
    } else {
      // Create new admin user
      console.log('Creating new admin user...');
      
      // Hash the password
      const hashedPassword = await bcrypt.hash('123456Aa@', 12);
      
      const adminUser = new User({
        name: 'Admin User',
        email: 'test5@gmail.com',
        passwordHash: hashedPassword,
        role: 'admin',
        provider: 'credentials',
        addresses: [],
        notifications: []
      });

      await adminUser.save();
      console.log('✅ Admin user created successfully');
    }

    console.log('Admin user details:');
    console.log('Email: test5@gmail.com');
    console.log('Password: 123456Aa@');
    console.log('Role: admin');
    console.log('Provider: credentials');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the script
createAdminUser();