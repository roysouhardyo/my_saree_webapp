import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { connectDB } from '@/lib/mongodb';
import Category from '@/models/Category';
import Product from '@/models/Product';

// GET /api/admin/categories - Get all categories with product counts
export async function GET(request: NextRequest) {
  try {
    const adminCheck = await requireAdmin(request);
    if (adminCheck instanceof NextResponse) {
      return adminCheck;
    }

    await connectDB();

    // Get all categories
    const categories = await Category.find({}).sort({ createdAt: -1 });

    // Get product counts for each category
    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
        const productCount = await Product.countDocuments({ 
          categories: { $in: [category.slug] },
          isActive: true 
        });
        
        return {
          ...category.toObject(),
          productCount
        };
      })
    );

    return NextResponse.json({
      success: true,
      categories: categoriesWithCounts
    });

  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// POST /api/admin/categories - Create new category
export async function POST(request: NextRequest) {
  try {
    const adminCheck = await requireAdmin(request);
    if (adminCheck instanceof NextResponse) {
      return adminCheck;
    }

    const body = await request.json();
    const { name, description, image, isActive = true } = body;

    if (!name || !description) {
      return NextResponse.json(
        { success: false, error: 'Name and description are required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Create slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check if category with same name or slug exists
    const existingCategory = await Category.findOne({
      $or: [
        { name: { $regex: new RegExp(`^${name}$`, 'i') } },
        { slug }
      ]
    });

    if (existingCategory) {
      return NextResponse.json(
        { success: false, error: 'Category with this name already exists' },
        { status: 400 }
      );
    }

    const category = new Category({
      name,
      slug,
      description,
      image: image || '',
      isActive
    });

    await category.save();

    return NextResponse.json({
      success: true,
      category: category.toObject()
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create category' },
      { status: 500 }
    );
  }
}