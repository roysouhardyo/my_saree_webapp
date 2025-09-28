const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Category Schema
const CategorySchema = new mongoose.Schema({
  name: String,
  slug: String,
  description: String,
  image: String,
  isActive: Boolean
}, { timestamps: true });

// Product Schema
const ProductSchema = new mongoose.Schema({
  title: String,
  categories: [String],
  isActive: Boolean
}, { timestamps: true });

const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

async function testCategoryCounts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all categories
    const categories = await Category.find({});
    console.log(`\nFound ${categories.length} categories:`);
    
    for (const category of categories) {
      console.log(`- ${category.name} (slug: ${category.slug}, active: ${category.isActive})`);
      
      // Count products for this category
      const productCount = await Product.countDocuments({
        categories: { $in: [category.slug] }
      });
      
      console.log(`  Products with this category: ${productCount}`);
      
      // Show some example products
      const exampleProducts = await Product.find({
        categories: { $in: [category.slug] }
      }).limit(3).select('title categories');
      
      if (exampleProducts.length > 0) {
        console.log(`  Example products:`);
        exampleProducts.forEach(product => {
          console.log(`    - ${product.title} (categories: ${product.categories.join(', ')})`);
        });
      }
      console.log('');
    }

    // Get total product count
    const totalProducts = await Product.countDocuments({});
    console.log(`Total products in database: ${totalProducts}`);

    // Show all product categories
    const allProducts = await Product.find({}).select('title categories');
    console.log('\nAll products and their categories:');
    allProducts.forEach(product => {
      console.log(`- ${product.title}: [${product.categories.join(', ')}]`);
    });

    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testCategoryCounts();