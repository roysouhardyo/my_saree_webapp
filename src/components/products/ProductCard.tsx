'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useCartWithNotifications } from '@/hooks/useCartWithNotifications';
import { formatPrice, calculateDiscountPercentage } from '@/lib/utils';

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
}

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
}

export default function ProductCard({ product, viewMode = 'grid' }: ProductCardProps) {
  const { addItem } = useCartWithNotifications();

  const handleAddToCart = () => {
    addItem({
      id: product._id,
      title: product.title,
      price: product.discountPrice || product.price,
      image: product.images[0] || '/placeholder-saree.svg',
      vendor: product.vendor.businessName,
      stock: product.stock
    });
  };

  const discountPercentage = product.discountPrice 
    ? calculateDiscountPercentage(product.price, product.discountPrice)
    : 0;

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="relative w-full md:w-48 h-64 md:h-48 flex-shrink-0">
            <Link href={`/products/${product._id}`}>
              <Image
                src={product.images[0] || '/placeholder-saree.svg'}
                alt={product.title}
                fill
                className="object-cover rounded-lg hover:scale-105 transition-transform duration-300"
              />
            </Link>
            {discountPercentage > 0 && (
              <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md text-sm font-semibold">
                {discountPercentage}% OFF
              </div>
            )}
            {product.stock === 0 && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                <span className="text-white font-semibold">Out of Stock</span>
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex justify-between items-start mb-3">
              <Link href={`/products/${product._id}`}>
                <h3 className="text-xl font-semibold text-gray-900 hover:text-pink-600 transition-colors leading-tight">
                  {product.title}
                </h3>
              </Link>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-red-500">
                <Heart className="w-5 h-5" />
              </Button>
            </div>
            
            <p className="text-gray-700 text-sm mb-3 font-medium">by {product.vendor.businessName}</p>
            <p className="text-gray-800 mb-5 leading-relaxed">{product.description}</p>
            
            <div className="flex items-center gap-4 mb-5">
              <div className="flex items-center">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="ml-1 text-sm text-gray-700 font-medium">
                  {product.rating.toFixed(1)} ({product.reviewCount} reviews)
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                <span className="capitalize">{product.category}</span>
                <span>•</span>
                <span className="capitalize">{product.fabric}</span>
                <span>•</span>
                <span className="capitalize">{product.occasion}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-gray-900">
                  {formatPrice(product.discountPrice || product.price)}
                </span>
                {product.discountPrice && (
                  <span className="text-lg text-gray-500 line-through">
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>
              
              <Button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex items-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                Add to Cart
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden group min-h-[420px]">
      <div className="relative aspect-[3/4] overflow-hidden">
        <Link href={`/products/${product._id}`}>
          <Image
            src={product.images[0] || '/placeholder-saree.svg'}
            alt={product.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>
        
        {discountPercentage > 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-3 py-1.5 rounded-md text-sm font-semibold shadow-md">
            {discountPercentage}% OFF
          </div>
        )}
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="absolute top-2 right-2 text-gray-400 hover:text-red-500 bg-white/90 hover:bg-white shadow-sm"
        >
          <Heart className="w-5 h-5" />
        </Button>
        
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
            <span className="text-white font-semibold text-lg">Out of Stock</span>
          </div>
        )}
      </div>
      
      <div className="p-5">
        <Link href={`/products/${product._id}`}>
          <h3 className="font-semibold text-gray-900 mb-2 hover:text-pink-600 transition-colors leading-tight min-h-[2.5rem]">
            {product.title}
          </h3>
        </Link>
        
        <p className="text-gray-700 text-sm mb-3 font-medium">by {product.vendor.businessName}</p>
        
        <div className="flex items-center mb-4">
          <Star className="w-4 h-4 text-yellow-400 fill-current" />
          <span className="ml-1 text-sm text-gray-700 font-medium">
            {product.rating.toFixed(1)} ({product.reviewCount})
          </span>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(product.discountPrice || product.price)}
            </span>
            {product.discountPrice && (
              <span className="text-sm text-gray-600 line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
        </div>
        
        <Button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="w-full flex items-center justify-center gap-2 bg-pink-600 hover:bg-pink-700 text-white font-medium py-3 rounded-lg transition-all duration-200 hover:scale-[1.02] shadow-sm hover:shadow-md"
          size="sm"
        >
          <ShoppingCart className="w-4 h-4" />
          Add to Cart
        </Button>
      </div>
    </div>
  );
}