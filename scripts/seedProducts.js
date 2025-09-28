const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Product Schema (matching the TypeScript model)
const ProductSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  description: {
    type: String,
    required: true,
  },
  categories: [{
    type: String,
    required: true,
  }],
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  salePrice: {
    type: Number,
    min: 0,
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  images: [{
    type: String,
    required: true,
  }],
  fabric: {
    type: String,
    required: true,
    enum: ['Cotton', 'Silk', 'Chiffon', 'Georgette', 'Crepe', 'Linen', 'Banarasi', 'Kanjivaram', 'Tussar', 'Other'],
  },
  color: {
    type: String,
    required: true,
  },
  size: {
    type: String,
    required: true,
    default: 'Free Size',
  },
  pattern: {
    type: String,
    required: true,
    enum: ['Solid', 'Printed', 'Embroidered', 'Woven', 'Block Print', 'Digital Print', 'Hand Painted', 'Other'],
  },
  occasion: {
    type: String,
    required: true,
    enum: ['Casual', 'Formal', 'Party', 'Wedding', 'Festival', 'Office', 'Traditional', 'Other'],
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  reviewsCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

// Mock product data (adapted from the API route) - removed _id fields to let MongoDB generate them
const mockProducts = [
  // Silk Sarees Collection
  {
    title: 'Banarasi Silk Saree with Gold Zari',
    slug: 'banarasi-silk-saree-gold-zari',
    description: 'Exquisite Banarasi silk saree featuring intricate gold zari work and traditional motifs. Perfect for weddings and special occasions.',
    price: 18500,
    salePrice: 16500,
    images: ['/products/silk-saree-1.jpg'],
    categories: ['silk'],
    fabric: 'Banarasi',
    color: 'Gold',
    size: 'Free Size',
    pattern: 'Woven',
    occasion: 'Wedding',
    vendorId: new mongoose.Types.ObjectId(),
    rating: 4.9,
    reviewsCount: 89,
    stock: 4,
    isActive: true
  },
  {
    title: 'Kanjivaram Silk Saree - Royal Blue',
    slug: 'kanjivaram-silk-saree-royal-blue',
    description: 'Authentic Kanjivaram silk saree in royal blue with contrasting gold border. Handwoven by master craftsmen.',
    price: 22000,
    salePrice: 19800,
    images: ['/products/silk-saree-2.jpg'],
    categories: ['silk'],
    fabric: 'Kanjivaram',
    color: 'Royal Blue',
    size: 'Free Size',
    pattern: 'Woven',
    occasion: 'Wedding',
    vendorId: new mongoose.Types.ObjectId(),
    rating: 4.8,
    reviewsCount: 156,
    stock: 3,
    isActive: true
  },
  {
    title: 'Tussar Silk Saree with Block Print',
    slug: 'tussar-silk-saree-block-print',
    description: 'Natural tussar silk saree with beautiful hand block print designs. Eco-friendly and comfortable.',
    price: 6500,
    salePrice: 5800,
    images: ['/products/silk-saree-3.jpg'],
    categories: ['silk'],
    fabric: 'Tussar',
    color: 'Natural',
    size: 'Free Size',
    pattern: 'Block Print',
    occasion: 'Casual',
    vendorId: new mongoose.Types.ObjectId(),
    rating: 4.4,
    reviewsCount: 67,
    stock: 8,
    isActive: true
  },
  {
    title: 'Mysore Silk Saree - Emerald Green',
    slug: 'mysore-silk-saree-emerald-green',
    description: 'Pure Mysore silk saree in emerald green with golden temple border. Classic South Indian elegance.',
    price: 14500,
    salePrice: 12900,
    images: ['/products/silk-saree-4.jpg'],
    categories: ['silk'],
    fabric: 'Silk',
    color: 'Emerald Green',
    size: 'Free Size',
    pattern: 'Woven',
    occasion: 'Traditional',
    vendorId: new mongoose.Types.ObjectId(),
    rating: 4.7,
    reviewsCount: 92,
    stock: 6,
    isActive: true
  },
  {
    title: 'Paithani Silk Saree - Peacock Motif',
    slug: 'paithani-silk-saree-peacock-motif',
    description: 'Traditional Paithani silk saree with peacock motifs and rich pallu. A masterpiece of Maharashtrian weaving.',
    price: 25000,
    salePrice: 22500,
    images: ['/products/silk-saree-5.jpg'],
    categories: ['silk'],
    fabric: 'Silk',
    color: 'Multi',
    size: 'Free Size',
    pattern: 'Woven',
    occasion: 'Wedding',
    vendorId: new mongoose.Types.ObjectId(),
    rating: 4.9,
    reviewsCount: 134,
    stock: 2,
    isActive: true
  },

  // Designer Sarees Collection
  {
    title: 'Sequin Embellished Designer Saree',
    slug: 'sequin-embellished-designer-saree',
    description: 'Glamorous designer saree with heavy sequin work and crystal embellishments. Perfect for cocktail parties.',
    price: 22500,
    salePrice: 20250,
    images: ['/products/designer-saree-1.webp'],
    categories: ['designer'],
    fabric: 'Georgette',
    color: 'Black',
    size: 'Free Size',
    pattern: 'Embroidered',
    occasion: 'Party',
    vendorId: new mongoose.Types.ObjectId(),
    rating: 4.9,
    reviewsCount: 203,
    stock: 2,
    isActive: true
  },
  {
    title: 'Bollywood Style Designer Saree',
    slug: 'bollywood-style-designer-saree',
    description: 'Inspired by Bollywood fashion, this designer saree features contemporary cuts and modern draping style.',
    price: 15800,
    salePrice: 14200,
    images: ['/products/designer-saree-2.webp'],
    categories: ['designer'],
    fabric: 'Crepe',
    color: 'Red',
    size: 'Free Size',
    pattern: 'Printed',
    occasion: 'Party',
    vendorId: new mongoose.Types.ObjectId(),
    rating: 4.6,
    reviewsCount: 145,
    stock: 5,
    isActive: true
  },
  {
    title: 'Indo-Western Fusion Designer Saree',
    slug: 'indo-western-fusion-designer-saree',
    description: 'Unique fusion design combining traditional saree with western elements. Pre-stitched for easy draping.',
    price: 12900,
    salePrice: 11600,
    images: ['/products/designer-saree-3.webp'],
    categories: ['designer'],
    fabric: 'Georgette',
    color: 'Navy Blue',
    size: 'Free Size',
    pattern: 'Printed',
    occasion: 'Party',
    vendorId: new mongoose.Types.ObjectId(),
    rating: 4.4,
    reviewsCount: 98,
    stock: 7,
    isActive: true
  },
  {
    title: 'Luxury Velvet Designer Saree',
    slug: 'luxury-velvet-designer-saree',
    description: 'Opulent velvet designer saree with gold thread embroidery and pearl work. Ultimate luxury statement.',
    price: 35000,
    salePrice: 31500,
    images: ['/products/designer-saree-4.webp'],
    categories: ['designer'],
    fabric: 'Other',
    color: 'Maroon',
    size: 'Free Size',
    pattern: 'Embroidered',
    occasion: 'Wedding',
    vendorId: new mongoose.Types.ObjectId(),
    rating: 4.9,
    reviewsCount: 87,
    stock: 1,
    isActive: true
  },
  {
    title: 'Contemporary Printed Designer Saree',
    slug: 'contemporary-printed-designer-saree',
    description: 'Modern digital prints with abstract patterns. Perfect for fashion-forward women.',
    price: 8900,
    salePrice: 8000,
    images: ['/products/designer-saree-5.webp'],
    categories: ['designer'],
    fabric: 'Crepe',
    color: 'Multi',
    size: 'Free Size',
    pattern: 'Digital Print',
    occasion: 'Casual',
    vendorId: new mongoose.Types.ObjectId(),
    rating: 4.3,
    reviewsCount: 76,
    stock: 12,
    isActive: true
  },

  // Cotton Sarees Collection
  {
    title: 'Handloom Cotton Saree - Khadi',
    slug: 'handloom-cotton-saree-khadi',
    description: 'Pure handspun khadi cotton saree promoting sustainable fashion. Comfortable and breathable.',
    price: 2800,
    salePrice: 2500,
    images: ['/products/cotton-saree-1.jpg'],
    categories: ['cotton'],
    fabric: 'Cotton',
    color: 'White',
    size: 'Free Size',
    pattern: 'Solid',
    occasion: 'Casual',
    vendorId: new mongoose.Types.ObjectId(),
    rating: 4.3,
    reviewsCount: 89,
    stock: 20,
    isActive: true
  },
  {
    title: 'Block Print Cotton Saree - Rajasthani',
    slug: 'block-print-cotton-saree-rajasthani',
    description: 'Traditional Rajasthani block print cotton saree with vibrant colors and ethnic patterns.',
    price: 3200,
    salePrice: 2900,
    images: ['/products/cotton-saree-2.jpg'],
    categories: ['cotton'],
    fabric: 'Cotton',
    color: 'Multi',
    size: 'Free Size',
    pattern: 'Block Print',
    occasion: 'Casual',
    vendorId: new mongoose.Types.ObjectId(),
    rating: 4.4,
    reviewsCount: 156,
    stock: 15,
    isActive: true
  },
  {
    title: 'Mangalgiri Cotton Saree',
    slug: 'mangalgiri-cotton-saree',
    description: 'Authentic Mangalgiri cotton saree from Andhra Pradesh with traditional checks and stripes.',
    price: 2200,
    salePrice: 1980,
    images: ['/products/cotton-saree-3.jpg'],
    categories: ['cotton'],
    fabric: 'Cotton',
    color: 'Blue',
    size: 'Free Size',
    pattern: 'Woven',
    occasion: 'Casual',
    vendorId: new mongoose.Types.ObjectId(),
    rating: 4.2,
    reviewsCount: 78,
    stock: 25,
    isActive: true
  },
  {
    title: 'Kalamkari Cotton Saree',
    slug: 'kalamkari-cotton-saree',
    description: 'Hand-painted Kalamkari cotton saree with mythological motifs and natural dyes.',
    price: 4500,
    salePrice: 4050,
    images: ['/products/cotton-saree-4.webp'],
    categories: ['cotton'],
    fabric: 'Cotton',
    color: 'Beige',
    size: 'Free Size',
    pattern: 'Hand Painted',
    occasion: 'Traditional',
    vendorId: new mongoose.Types.ObjectId(),
    rating: 4.6,
    reviewsCount: 134,
    stock: 12,
    isActive: true
  },
  {
    title: 'Tant Cotton Saree - Bengali',
    slug: 'tant-cotton-saree-bengali',
    description: 'Traditional Bengali tant cotton saree with red border. Perfect for daily wear and festivals.',
    price: 1800,
    salePrice: 1620,
    images: ['/products/cotton-saree-5.webp'],
    categories: ['cotton'],
    fabric: 'Cotton',
    color: 'White',
    size: 'Free Size',
    pattern: 'Woven',
    occasion: 'Casual',
    vendorId: new mongoose.Types.ObjectId(),
    rating: 4.1,
    reviewsCount: 203,
    stock: 30,
    isActive: true
  },

  // Wedding Sarees Collection
  {
    title: 'Bridal Red Kanjivaram Saree',
    slug: 'bridal-red-kanjivaram-saree',
    description: 'Stunning bridal red Kanjivaram saree with heavy gold zari work and temple border. Perfect for the big day.',
    price: 45000,
    salePrice: 40500,
    images: ['/products/wedding-saree-1.webp'],
    categories: ['wedding'],
    fabric: 'Kanjivaram',
    color: 'Red',
    size: 'Free Size',
    pattern: 'Woven',
    occasion: 'Wedding',
    vendorId: new mongoose.Types.ObjectId(),
    rating: 4.9,
    reviewsCount: 234,
    stock: 2,
    isActive: true
  },
  {
    title: 'Royal Maroon Wedding Saree',
    slug: 'royal-maroon-wedding-saree',
    description: 'Opulent maroon wedding saree with intricate embroidery and stone work. Fit for a queen.',
    price: 38000,
    salePrice: 34200,
    images: ['/products/wedding-saree-2.webp'],
    categories: ['wedding'],
    fabric: 'Silk',
    color: 'Maroon',
    size: 'Free Size',
    pattern: 'Embroidered',
    occasion: 'Wedding',
    vendorId: new mongoose.Types.ObjectId(),
    rating: 4.8,
    reviewsCount: 187,
    stock: 3,
    isActive: true
  },
  {
    title: 'Golden Banarasi Wedding Saree',
    slug: 'golden-banarasi-wedding-saree',
    description: 'Magnificent golden Banarasi saree with all-over zari work. Traditional elegance for weddings.',
    price: 32000,
    salePrice: 28800,
    images: ['/products/wedding-saree-3.webp'],
    categories: ['wedding'],
    fabric: 'Banarasi',
    color: 'Gold',
    size: 'Free Size',
    pattern: 'Woven',
    occasion: 'Wedding',
    vendorId: new mongoose.Types.ObjectId(),
    rating: 4.9,
    reviewsCount: 298,
    stock: 4,
    isActive: true
  },
  {
    title: 'Pink Lehenga Style Wedding Saree',
    slug: 'pink-lehenga-style-wedding-saree',
    description: 'Contemporary pink lehenga-style wedding saree with heavy embellishments and pre-stitched pleats.',
    price: 28500,
    salePrice: 25650,
    images: ['/products/wedding-saree-4.webp'],
    categories: ['wedding'],
    fabric: 'Georgette',
    color: 'Pink',
    size: 'Free Size',
    pattern: 'Embroidered',
    occasion: 'Wedding',
    vendorId: new mongoose.Types.ObjectId(),
    rating: 4.7,
    reviewsCount: 156,
    stock: 5,
    isActive: true
  },
  {
    title: 'Emerald Green Wedding Saree',
    slug: 'emerald-green-wedding-saree',
    description: 'Rich emerald green wedding saree with gold thread embroidery and pearl work. Regal beauty.',
    price: 35000,
    salePrice: 31500,
    images: ['/products/wedding-saree-5.webp'],
    categories: ['wedding'],
    fabric: 'Silk',
    color: 'Green',
    size: 'Free Size',
    pattern: 'Embroidered',
    occasion: 'Wedding',
    vendorId: new mongoose.Types.ObjectId(),
    rating: 4.8,
    reviewsCount: 167,
    stock: 3,
    isActive: true
  }
];

async function seedProducts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Insert new products
    const insertedProducts = await Product.insertMany(mockProducts);
    console.log(`Successfully seeded ${insertedProducts.length} products`);

    // Close connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding products:', error);
    process.exit(1);
  }
}

// Run the seed function
seedProducts();