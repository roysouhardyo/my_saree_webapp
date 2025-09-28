import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Rashida Begum',
    location: 'Dhaka',
    rating: 5,
    comment: 'Absolutely beautiful sarees! The quality is exceptional and the delivery was super fast. Highly recommended!'
  },
  {
    name: 'Fatima Khan',
    location: 'Chittagong',
    rating: 5,
    comment: 'I ordered a silk saree for my daughter\'s wedding. The craftsmanship is outstanding and it looked exactly like the photos.'
  },
  {
    name: 'Nasreen Ahmed',
    location: 'Sylhet',
    rating: 5,
    comment: 'Great collection and excellent customer service. The saree I bought received so many compliments at the function!'
  }
];

export default function TestimonialsSection() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            What Our Customers Say
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Read testimonials from our satisfied customers across Bangladesh
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-4 italic">
                &ldquo;{testimonial.comment}&rdquo;
              </p>
              <div className="border-t pt-4">
                <p className="font-semibold text-gray-900">{testimonial.name}</p>
                <p className="text-gray-600 text-sm">{testimonial.location}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}