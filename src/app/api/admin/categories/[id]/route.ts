import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { connectDB } from '@/lib/mongodb';
import Category from '@/models/Category';
import Product from '@/models/Product';

// GET /api/admin/categories/[id] - Get single category
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const adminCheck = await requireAdmin(request);
    if (adminCheck instanceof NextResponse) {
      return adminCheck;
    }

    await connectDB();

    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    // Get product count for this category
    const productCount = await Product.countDocuments({ 
      categories: { $in: [category.slug] },
      isActive: true 
    });

    return NextResponse.json({
      success: true,
      category: {
        ...category.toObject(),
        productCount
      }
    });

  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch category' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/categories/[id] - Update category
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const adminCheck = await requireAdmin(request);
    if (adminCheck instanceof NextResponse) {
      return adminCheck;
    }

    const body = await request.json();
    const { name, description, image, isActive } = body;

    await connectDB();

    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    // If name is being updated, check for duplicates
    if (name && name !== category.name) {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const existingCategory = await Category.findOne({
        _id: { $ne: id },
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

      category.name = name;
      category.slug = slug;
    }

    // Update other fields
    if (description !== undefined) category.description = description;
    if (image !== undefined) category.image = image;
    if (isActive !== undefined) category.isActive = isActive;

    category.updatedAt = new Date();
    await category.save();

    return NextResponse.json({
      success: true,
      category: category.toObject()
    });

  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/categories/[id] - Delete category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const adminCheck = await requireAdmin(request);
    if (adminCheck instanceof NextResponse) {
      return adminCheck;
    }

    await connectDB();

    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    // Check if category has products
    const productCount = await Product.countDocuments({ categories: { $in: [category.slug] } });
    if (productCount > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Cannot delete category. It has ${productCount} products associated with it. Please move or delete the products first.` 
        },
        { status: 400 }
      );
    }

    await Category.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}