import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const categories = [
  {
    id: 'silk-sarees',
    name: 'Silk Sarees',
    description: 'Luxurious silk sarees for special occasions',
    image: '/categories/Silk card.webp',
    href: '/products?category=silk',
    count: 5
  },
  {
    id: 'cotton-sarees',
    name: 'Cotton Sarees',
    description: 'Comfortable cotton sarees for daily wear',
    image: '/categories/Cotton card.webp',
    href: '/products?category=cotton',
    count: 5
  },
  {
    id: 'designer-sarees',
    name: 'Designer Sarees',
    description: 'Contemporary designer sarees',
    image: '/categories/Design card.webp',
    href: '/products?category=designer',
    count: 5
  },
  {
    id: 'wedding-sarees',
    name: 'Wedding Sarees',
    description: 'Elegant sarees for weddings and celebrations',
    image: '/categories/weading card.webp',
    href: '/products?category=wedding',
    count: 5
  }
];

export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Shop by Category
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our curated collection of sarees organized by style, fabric, and occasion
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={category.href}
              className="group bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
            >
              <div className="relative h-48 w-full">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-pink-600 transition-colors">
                  {category.name}
                </h3>
                <p className="text-gray-600 mb-3">
                  {category.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {category.count} products
                  </span>
                  <span className="text-pink-600 font-medium group-hover:underline">
                    Shop Now →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Can&apos;t find what you&apos;re looking for?
          </h2>
          <p className="text-gray-600 mb-6">
            Browse our complete collection or use our search feature
          </p>
          <Link
            href="/products"
            className="inline-flex items-center px-6 py-3 bg-pink-600 text-white font-medium rounded-lg hover:bg-pink-700 transition-colors"
          >
            View All Products
          </Link>
        </div>
      </div>
    </div>
  );
}