'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

const categoryImages = [
  {
    src: '/categories/Silk card.webp',
    alt: 'Beautiful Silk Sarees - Traditional Elegance',
    title: 'Silk Sarees'
  },
  {
    src: '/categories/Cotton card.webp',
    alt: 'Beautiful Cotton Sarees - Traditional Elegance',
    title: 'Cotton Sarees'
  },
  {
    src: '/categories/Design card.webp',
    alt: 'Beautiful Designer Sarees - Traditional Elegance',
    title: 'Designer Sarees'
  },
  {
    src: '/categories/weading card.webp',
    alt: 'Beautiful Wedding Sarees - Traditional Elegance',
    title: 'Wedding Sarees'
  }
];

export default function SareeCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === categoryImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-96 w-full rounded-lg overflow-hidden shadow-2xl">
      {categoryImages.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Image
            src={image.src}
            alt={image.alt}
            fill
            className="object-cover"
            priority={index === 0}
          />
          {/* Overlay with category title */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end justify-center pb-6">
            <div className="px-6 py-3">
              <p className="text-white/60 font-semibold text-lg text-center drop-shadow-lg">
                {image.title}
              </p>
              <p className="text-white/50 text-sm text-center drop-shadow-lg">Traditional Elegance</p>
            </div>
          </div>
        </div>
      ))}
      
      {/* Dots indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {categoryImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition-colors duration-300 ${
              index === currentIndex 
                ? 'bg-white' 
                : 'bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}