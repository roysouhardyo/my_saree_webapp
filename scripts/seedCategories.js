const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Category Schema (matching the TypeScript model)
const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    maxlength: [100, 'Category name cannot exceed 100 characters']
  },
  slug: {
    type: String,
    required: [true, 'Category slug is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Category description is required'],
    trim: true,
    maxlength: [500, 'Category description cannot exceed 500 characters']
  },
  image: {
    type: String,
    default: '',
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Pre-save middleware to generate slug if not provided
CategorySchema.pre('save', function(next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);

// Categories to seed
const categories = [
  {
    name: 'Silk Sarees',
    slug: 'silk',
    description: 'Luxurious silk sarees for special occasions and weddings',
    image: '/categories/Silk card.webp',
    isActive: true
  },
  {
    name: 'Cotton Sarees',
    slug: 'cotton',
    description: 'Comfortable and breathable cotton sarees for daily wear',
    image: '/categories/Cotton card.webp',
    isActive: true
  },
  {
    name: 'Designer Sarees',
    slug: 'designer',
    description: 'Contemporary designer collections with modern cuts and styles',
    image: '/categories/Design card.webp',
    isActive: true
  },
  {
    name: 'Wedding Sarees',
    slug: 'wedding',
    description: 'Bridal and wedding special sarees for your big day',
    image: '/categories/weading card.webp',
    isActive: true
  }
];

async function seedCategories() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing categories
    await Category.deleteMany({});
    console.log('Cleared existing categories');

    // Insert new categories
    const insertedCategories = await Category.insertMany(categories);
    console.log(`Successfully seeded ${insertedCategories.length} categories`);

    // Display seeded categories
    insertedCategories.forEach(category => {
      console.log(`- ${category.name} (${category.slug})`);
    });

    // Close connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding categories:', error);
    process.exit(1);
  }
}

// Run the seed function
seedCategories();