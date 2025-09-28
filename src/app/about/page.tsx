import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            About Saree Not Sorry
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're passionate about bringing you the finest collection of authentic sarees 
            from trusted vendors across Bangladesh, celebrating the timeless beauty of traditional wear.
          </p>
        </div>

        {/* Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
            <p className="text-gray-600 mb-4">
              Founded with a vision to make authentic Bangladeshi sarees accessible to women everywhere, 
              Saree Not Sorry began as a small initiative to connect traditional artisans with 
              modern customers who appreciate quality and craftsmanship.
            </p>
            <p className="text-gray-600 mb-4">
              Today, we work with over 50 trusted vendors across Bangladesh, ensuring that every saree 
              in our collection meets our high standards for quality, authenticity, and ethical sourcing.
            </p>
            <p className="text-gray-600">
              From everyday cotton sarees to luxurious silk pieces for special occasions, 
              we curate each piece with care, bringing you the best of Bangladeshi textile heritage.
            </p>
          </div>
          <div className="relative h-96 rounded-lg overflow-hidden">
            <Image
              src="/hero-saree.svg"
              alt="Traditional saree craftsmanship"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎨</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Authenticity</h3>
              <p className="text-gray-600">
                Every saree is carefully selected for its authentic craftsmanship and traditional techniques.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✨</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Quality</h3>
              <p className="text-gray-600">
                We maintain the highest standards of quality, ensuring each piece meets our rigorous criteria.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤝</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Fair Trade</h3>
              <p className="text-gray-600">
                We work directly with artisans and vendors, ensuring fair compensation and ethical practices.
              </p>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Meet Our Team</h2>
          <div className="flex justify-center">
            <div className="text-center">
              <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Souhardya Roy</h3>
              <p className="text-pink-600 mb-2">Founder & CEO</p>
              <p className="text-gray-600 text-sm max-w-md">
                Passionate about preserving traditional textile heritage and making authentic sarees accessible to women worldwide. Leading the vision to connect artisans with customers who appreciate quality craftsmanship.
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-pink-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Explore Our Collection?
          </h2>
          <p className="text-gray-600 mb-6">
            Discover beautiful sarees that celebrate tradition while embracing modern style.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center px-6 py-3 bg-pink-600 text-white font-medium rounded-lg hover:bg-pink-700 transition-colors"
          >
            Shop Now
          </Link>
        </div>
      </div>
    </div>
  );
}