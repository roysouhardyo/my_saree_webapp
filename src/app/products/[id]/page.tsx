'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { Star, ShoppingCart, Heart, Share2, Truck, Shield, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { useCartWithNotifications } from '@/hooks/useCartWithNotifications';
import { formatDate } from '@/lib/utils';

interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  discountPrice?: number;
  images: string[];
  category: string;
  fabric: string;
  occasion: string;
  vendor: {
    _id: string;
    businessName: string;
  };
  rating: number;
  reviewCount: number;
  stock: number;
  isActive: boolean;
  care?: string;
  blouse?: string;
  length?: string;
  reviews?: Array<{
    _id: string;
    userId: { name: string };
    rating: number;
    comment: string;
    createdAt: Date;
  }>;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { addItem, openCart } = useCartWithNotifications();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    if (!session) {
      // Redirect to login if user is not authenticated
      router.push('/auth/signin');
      return;
    }

    if (!product) return;

    // Add item to cart
    addItem({
      id: product._id,
      title: product.title,
      image: product.images?.[0] || '/placeholder-saree.svg',
      price: product.discountPrice || product.price,
      vendor: product.vendor.businessName,
      stock: product.stock
    });

    // Open cart to show the added item
    openCart();
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${params.id}`);
        
        if (!response.ok) {
          throw new Error('Product not found');
        }
        
        const data = await response.json();
        setProduct(data.product);
      } catch (err) {
        setError('Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);



  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  const discountPercentage = product.discountPrice 
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-lg overflow-hidden shadow-lg">
              <Image
                src={product.images?.[selectedImage] || product.images?.[0] || '/placeholder-saree.svg'}
                alt={product.title}
                width={600}
                height={600}
                className="w-full h-full object-cover"
              />
            </div>
            
            {product.images && product.images.length > 1 && (
              <div className="flex space-x-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      selectedImage === index ? 'border-pink-600' : 'border-gray-200'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.title} ${index + 1}`}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{product.title}</h1>
              <p className="text-lg text-gray-600 mt-2">{product.vendor.businessName}</p>
            </div>

            {/* Rating */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(product.rating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-700 font-medium">
                {product.rating} ({product.reviewCount} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center space-x-4">
              <span className="text-3xl font-bold text-gray-900">
                TK {product.discountPrice || product.price}
              </span>
              {product.discountPrice && (
                <>
                  <span className="text-xl text-gray-600 line-through">
                    TK {product.price}
                  </span>
                  <Badge variant="destructive" className="text-sm font-semibold text-white bg-red-600">
                    {discountPercentage}% OFF
                  </Badge>
                </>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="border-gray-400 text-gray-800 bg-gray-50 font-medium">{product.fabric}</Badge>
                <Badge variant="outline" className="border-gray-400 text-gray-800 bg-blue-50 font-medium">{product.occasion}</Badge>
                <Badge variant="outline" className="border-gray-400 text-gray-800 bg-green-50 font-medium">{product.category}</Badge>
              </div>
              
              {product.stock > 0 ? (
                <p className="text-green-600 font-medium">In Stock ({product.stock} available)</p>
              ) : (
                <p className="text-red-600 font-medium">Out of Stock</p>
              )}
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-800 leading-relaxed">{product.description}</p>
            </div>

            {/* Product Details */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">Product Details</h3>
              <div className="grid grid-cols-1 gap-2 text-sm">
                {product.length && (
                  <div className="flex justify-between">
                    <span className="text-gray-700">Length:</span>
                    <span className="text-gray-900">{product.length}</span>
                  </div>
                )}
                {product.blouse && (
                  <div className="flex justify-between">
                    <span className="text-gray-700">Blouse:</span>
                    <span className="text-gray-900">{product.blouse}</span>
                  </div>
                )}
                {product.care && (
                  <div className="flex justify-between">
                    <span className="text-gray-700">Care:</span>
                    <span className="text-gray-900">{product.care}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-900">Quantity:</label>
                <div className="flex items-center border border-gray-400 rounded-md bg-white">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 text-gray-800 hover:text-gray-900 hover:bg-gray-100 font-medium"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 border-x border-gray-400 text-gray-900 font-semibold bg-gray-50 min-w-[3rem] text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-3 py-2 text-gray-800 hover:text-gray-900 hover:bg-gray-100 font-medium"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button 
                  className="flex-1 bg-pink-600 hover:bg-pink-700"
                  disabled={product.stock === 0}
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add to Cart
                </Button>
                <Button variant="outline" size="icon">
                  <Heart className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
              <div className="text-center">
                <Truck className="w-8 h-8 mx-auto text-pink-600 mb-2" />
                <p className="text-sm text-gray-600">Free Shipping</p>
              </div>
              <div className="text-center">
                <Shield className="w-8 h-8 mx-auto text-pink-600 mb-2" />
                <p className="text-sm text-gray-600">Secure Payment</p>
              </div>
              <div className="text-center">
                <RotateCcw className="w-8 h-8 mx-auto text-pink-600 mb-2" />
                <p className="text-sm text-gray-600">Easy Returns</p>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        {product.reviews && product.reviews.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>
            <div className="space-y-4">
              {product.reviews.map((review) => (
                <Card key={review._id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-gray-900">{review.userId.name}</p>
                        <div className="flex items-center mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-500">
                        {formatDate(review.createdAt)}
                      </p>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}