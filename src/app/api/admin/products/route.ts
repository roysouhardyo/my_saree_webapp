import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';

// GET - Fetch all products for admin
export async function GET(req: NextRequest) {
  const adminCheck = await requireAdmin(req);
  
  if (adminCheck instanceof NextResponse) {
    return adminCheck;
  }

  try {
    await connectDB();
    
    const products = await Product.find({})
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(products);
  } catch (error) {
    console.error('Products fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST - Create new product
export async function POST(req: NextRequest) {
  const adminCheck = await requireAdmin(req);
  
  if (adminCheck instanceof NextResponse) {
    return adminCheck;
  }

  try {
    await connectDB();
    
    const body = await req.json();
    const {
      name,
      description,
      price,
      discountPrice,
      category,
      stock,
      isActive = true
    } = body;

    // Validation
    if (!name || !description || !price || !category || stock === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create default images based on category
    const defaultImages = [`/products/${category}-saree-1.svg`];

    const product = new Product({
      name,
      description,
      price,
      discountPrice: discountPrice || undefined,
      category,
      images: defaultImages,
      stock,
      isActive,
      features: [],
      specifications: {
        fabric: category === 'cotton' ? 'Cotton' : category === 'silk' ? 'Silk' : 'Mixed',
        length: '6.3 meters',
        blouse: 'Included',
        care: 'Dry clean recommended'
      }
    });

    await product.save();

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Product creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}