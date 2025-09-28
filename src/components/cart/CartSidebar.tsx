'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { X, Plus, Minus, ShoppingBag, Trash2, Heart, ArrowRight } from 'lucide-react';
import { useCartWithNotifications } from '@/hooks/useCartWithNotifications';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

const CartSidebar = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const { 
    items, 
    isOpen, 
    closeCart, 
    removeItem, 
    updateQuantity, 
    getTotalPrice, 
    getTotalItems 
  } = useCartWithNotifications();

  const totalPrice = getTotalPrice();
  const totalItems = getTotalItems();

  const handleCheckout = () => {
    if (!session) {
      closeCart();
      router.push('/auth/signin?callbackUrl=/checkout');
    } else {
      closeCart();
      router.push('/checkout');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300"
        onClick={closeCart}
      />
      
      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-out">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-pink-50 to-purple-50 px-6 py-5 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Shopping Cart
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart
              </p>
            </div>
            <button
              onClick={closeCart}
              className="p-2 hover:bg-white/80 rounded-full transition-all duration-200 hover:scale-105"
            >
              <X className="h-6 w-6 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12">
              <div className="relative mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center">
                  <ShoppingBag className="h-12 w-12 text-pink-400" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
                  <Heart className="h-4 w-4 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Your cart is empty
              </h3>
              <p className="text-gray-500 mb-8 max-w-sm leading-relaxed">
                Discover our beautiful collection of sarees and add your favorites to get started!
              </p>
              <Link href="/products">
                <Button 
                  onClick={closeCart}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-3 rounded-full font-medium transition-all duration-200 hover:scale-105 shadow-lg"
                >
                  Explore Sarees
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {items.map((item, index) => (
                <div 
                  key={item.id} 
                  className="group bg-white rounded-xl border border-gray-100 hover:border-pink-200 hover:shadow-md transition-all duration-200 overflow-hidden"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="p-4">
                    <div className="flex items-start space-x-4">
                      {/* Product Image */}
                      <div className="relative h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-50">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                      
                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 text-sm leading-tight mb-1 line-clamp-2">
                          {item.title}
                        </h4>
                        <p className="text-xs text-gray-500 mb-2">
                          by {item.vendor}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-pink-600">
                            {formatPrice(item.price)}
                          </span>
                          <span className="text-xs text-gray-400">
                            {item.stock} in stock
                          </span>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"
                        title="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
                      <div className="flex items-center bg-gray-50 rounded-full p-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-2 hover:bg-white rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 hover:text-gray-900"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-4 w-4 text-gray-700" />
                        </button>
                        <span className="text-sm font-semibold text-gray-900 px-4 py-1 min-w-[3rem] text-center bg-white rounded-md border border-gray-200">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-2 hover:bg-white rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 hover:text-gray-900"
                          disabled={item.quantity >= item.stock}
                        >
                          <Plus className="h-4 w-4 text-gray-700" />
                        </button>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Subtotal</p>
                        <p className="font-bold text-gray-900 text-lg">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 bg-gray-50/50 backdrop-blur-sm">
            {/* Order Summary */}
            <div className="px-6 py-4 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Subtotal ({totalItems} items)</span>
                <span className="font-medium text-gray-900 text-base">{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium text-green-600">Free</span>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                    {formatPrice(totalPrice)}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="px-6 pb-6 space-y-3">
              <Button 
                onClick={handleCheckout}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white py-4 rounded-xl font-semibold text-base transition-all duration-200 hover:scale-[1.02] shadow-lg hover:shadow-xl"
              >
                {!session ? 'Login to Checkout' : 'Proceed to Checkout'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <Link href="/products">
                <Button 
                  variant="outline" 
                  className="w-full py-3 rounded-xl font-medium border-gray-200 hover:border-pink-300 hover:bg-pink-50 transition-all duration-200"
                  onClick={closeCart}
                >
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CartSidebar;