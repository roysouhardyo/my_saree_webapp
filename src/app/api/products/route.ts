import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const fabric = searchParams.get('fabric') || '';
    const occasion = searchParams.get('occasion') || '';
    const minPrice = searchParams.get('minPrice') || '';
    const maxPrice = searchParams.get('maxPrice') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    // Build query object
    const query: any = { isActive: true };

    // Apply filters
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) {
      query.categories = { $in: [category] };
    }

    if (fabric) {
      query.fabric = fabric;
    }

    if (occasion) {
      query.occasion = occasion;
    }

    if (minPrice || maxPrice) {
      query.$expr = {};
      if (minPrice && maxPrice) {
        query.$expr.$and = [
          { $gte: [{ $ifNull: ['$salePrice', '$price'] }, parseInt(minPrice)] },
          { $lte: [{ $ifNull: ['$salePrice', '$price'] }, parseInt(maxPrice)] }
        ];
      } else if (minPrice) {
        query.$expr.$gte = [{ $ifNull: ['$salePrice', '$price'] }, parseInt(minPrice)];
      } else if (maxPrice) {
        query.$expr.$lte = [{ $ifNull: ['$salePrice', '$price'] }, parseInt(maxPrice)];
      }
    }

    // Build sort object
    let sortObject: any = {};
    switch (sortBy) {
      case 'price':
        sortObject = { price: 1 };
        break;
      case '-price':
        sortObject = { price: -1 };
        break;
      case '-rating':
        sortObject = { rating: -1 };
        break;
      case 'title':
        sortObject = { title: 1 };
        break;
      case '-createdAt':
        sortObject = { createdAt: -1 };
        break;
      default: // 'createdAt'
        sortObject = { createdAt: 1 };
        break;
    }

    // Get total count for pagination
    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / limit);
    const skip = (page - 1) * limit;

    // Fetch products with pagination
    const products = await Product.find(query)
      .sort(sortObject)
      .skip(skip)
      .limit(limit)
      .lean();

    // Transform products to match the expected format
    const transformedProducts = products.map(product => ({
      _id: (product._id as any).toString(),
      title: product.title,
      description: product.description,
      price: product.price,
      discountPrice: product.salePrice,
      images: product.images,
      category: product.categories[0], // Use first category for backward compatibility
      fabric: product.fabric,
      occasion: product.occasion,
      vendor: {
        _id: product.vendorId?.toString() || 'default-vendor',
        businessName: 'Saree Not Sorry' // Default vendor name
      },
      rating: product.rating,
      reviewCount: product.reviewsCount,
      stock: product.stock,
      isActive: product.isActive
    }));

    return NextResponse.json({
      success: true,
      products: transformedProducts,
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Error in products API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}