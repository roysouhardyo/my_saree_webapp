import { Truck, Shield, Headphones, RotateCcw } from 'lucide-react';

const features = [
  {
    icon: Truck,
    title: 'Free Shipping',
    description: 'Free delivery on orders above TK 999'
  },
  {
    icon: Shield,
    title: 'Secure Payment',
    description: '100% secure and encrypted transactions'
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'Round-the-clock customer assistance'
  },
  {
    icon: RotateCcw,
    title: 'Easy Returns',
    description: '7-day hassle-free return policy'
  }
];

export default function FeaturesSection() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-pink-100 rounded-full mb-4">
                  <Icon className="w-8 h-8 text-pink-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}