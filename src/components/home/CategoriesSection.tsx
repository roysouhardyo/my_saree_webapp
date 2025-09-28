'use client';

import Image from 'next/image';
import Link from 'next/link';

const categories = [
  {
    name: 'Silk Sarees',
    image: '/categories/Silk card.webp',
    href: '/products?category=silk',
    description: 'Luxurious silk sarees for special occasions'
  },
  {
    name: 'Cotton Sarees',
    image: '/categories/Cotton card.webp',
    href: '/products?category=cotton',
    description: 'Comfortable cotton sarees for daily wear'
  },
  {
    name: 'Designer Sarees',
    image: '/categories/Design card.webp',
    href: '/products?category=designer',
    description: 'Contemporary designer collections'
  },
  {
    name: 'Wedding Sarees',
    image: '/categories/weading card.webp',
    href: '/products?category=wedding',
    description: 'Bridal and wedding special sarees'
  }
];

export default function CategoriesSection() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Shop by Category
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explore our diverse collection of sarees, each category crafted to perfection
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={category.href}
              className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {category.name}
                </h3>
                <p className="text-gray-600 text-sm">
                  {category.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}