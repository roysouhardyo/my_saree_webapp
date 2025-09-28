'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import SareeCarousel from './SareeCarousel';

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-pink-500 via-orange-400 to-purple-600 text-white">
      <div className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
              Discover Exquisite
              <span className="block text-yellow-300">Sarees</span>
            </h1>
            <p className="text-xl text-pink-100 leading-relaxed">
              From traditional handwoven masterpieces to contemporary designer collections, 
              find the perfect saree for every occasion. Celebrate your elegance with our 
              curated selection of premium sarees.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-pink-50">
                <Link href="/products">Shop Now</Link>
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-2 border-white bg-white/10 backdrop-blur-sm text-white hover:bg-white hover:text-purple-600 font-semibold shadow-lg"
              >
                <Link href="/categories">Browse Categories</Link>
              </Button>
            </div>
          </div>
          
          <div className="relative">
            <SareeCarousel />
          </div>
        </div>
      </div>
    </section>
  );
}