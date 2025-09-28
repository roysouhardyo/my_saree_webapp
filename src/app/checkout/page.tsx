'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, MapPin, CreditCard, Truck, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCartStore } from '@/store/cartStore';
import { useNotification } from '@/contexts/NotificationContext';
import { formatPrice } from '@/lib/utils';

// Phone validation function for Bangladeshi numbers
const isValidBangladeshiPhone = (phone: string): boolean => {
  // Remove all spaces and special characters except +
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  
  // Bangladeshi phone number patterns:
  // +8801XXXXXXXXX (11 digits after +880)
  // 8801XXXXXXXXX (11 digits starting with 880)
  // 01XXXXXXXXX (11 digits starting with 01)
  const patterns = [
    /^\+8801[3-9]\d{8}$/, // +8801XXXXXXXXX
    /^8801[3-9]\d{8}$/,   // 8801XXXXXXXXX
    /^01[3-9]\d{8}$/      // 01XXXXXXXXX
  ];
  
  return patterns.some(pattern => pattern.test(cleanPhone));
};

// Pincode validation function for Bangladeshi postal codes
const isValidBangladeshiPincode = (pincode: string): boolean => {
  // Remove all spaces and special characters
  const cleanPincode = pincode.replace(/[\s\-]/g, '');
  
  // Bangladeshi postal codes are 4 digits
  const pattern = /^\d{4}$/;
  
  return pattern.test(cleanPincode);
};

interface ShippingAddress {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { addNotification } = useNotification();
  const cart = items;
  
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');
  
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: session?.user?.name || '',
    phone: '',
    email: session?.user?.email || '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });

  const totalPrice = getTotalPrice();
  const shippingCost = 0; // Free shipping
  const finalTotal = totalPrice + shippingCost;

  useEffect(() => {
    console.log('Session status:', session);
    
    if (status === 'loading') return; // Still loading
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    if (cart.length === 0) {
      router.push('/products');
      return;
    }
  }, [session, status, cart, router]);

  const handleInputChange = (field: keyof ShippingAddress, value: string) => {
    setShippingAddress(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    const required = ['fullName', 'phone', 'email', 'address', 'city', 'state', 'pincode'];
    const allFieldsFilled = required.every(field => shippingAddress[field as keyof ShippingAddress].trim() !== '');
    
    // Additional phone number validation
    const phoneValid = isValidBangladeshiPhone(shippingAddress.phone);
    
    // Additional pincode validation
    const pincodeValid = isValidBangladeshiPincode(shippingAddress.pincode);
    
    return allFieldsFilled && phoneValid && pincodeValid;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      if (!isValidBangladeshiPhone(shippingAddress.phone)) {
        addNotification({
          type: 'error',
          title: 'Invalid Phone Number',
          message: 'Please enter a valid Bangladeshi phone number (e.g., 01712345678 or +8801712345678)'
        });
      } else if (!isValidBangladeshiPincode(shippingAddress.pincode)) {
        addNotification({
          type: 'error',
          title: 'Invalid Postal Code',
          message: 'Please enter a valid 4-digit Bangladeshi postal code (e.g., 1000)'
        });
      } else {
        addNotification({
          type: 'error',
          title: 'Form Validation Error',
          message: 'Please fill in all required fields'
        });
      }
      return;
    }

    setLoading(true);
    
    try {
      const orderData = {
        items: items.map(item => ({
          productId: item.id,
          quantity: item.quantity
        })),
        shippingAddress: {
          name: shippingAddress.fullName,
          phone: shippingAddress.phone,
          address: shippingAddress.address,
          city: shippingAddress.city,
          state: shippingAddress.state,
          pincode: shippingAddress.pincode
        }
      };

      console.log('Sending order data:', orderData);

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to place order: ${response.status}`);
      }

      const result = await response.json();
      console.log('API response:', result);
      
      // The API returns the order object directly, not wrapped in a success object
      if (result._id) {
        setOrderId(result._id);
        setOrderPlaced(true);
        clearCart();
        
        addNotification({
          type: 'success',
          title: 'Order Placed Successfully!',
          message: `Your order #${result.orderNumber || result._id.slice(-8)} has been placed. You will receive updates via notifications.`,
          duration: 5000,
          action: {
            label: 'View Order',
            onClick: () => router.push(`/orders/${result._id}`),
          },
        });
      } else {
        throw new Error('Failed to place order - no order ID returned');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      addNotification({
        type: 'error',
        title: 'Order Failed',
        message: `Failed to place order: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!session || items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="mb-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
            <p className="text-gray-600">Thank you for your order. We&apos;ll process it soon.</p>
          </div>
          
          <div className="bg-white rounded-lg p-6 mb-6 border border-gray-200">
            <h2 className="font-semibold text-gray-900 mb-2">Order Details</h2>
            <p className="text-sm text-gray-600 mb-1">Order ID: <span className="font-mono">{orderId}</span></p>
            <p className="text-sm text-gray-600 mb-1">Total Amount: <span className="font-semibold">{formatPrice(finalTotal)}</span></p>
            <p className="text-sm text-gray-600">Payment Method: Cash on Delivery</p>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={() => router.push('/orders')}
              className="w-full"
            >
              View My Orders
            </Button>
            <Button 
              variant="outline"
              onClick={() => router.push('/products')}
              className="w-full"
            >
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600 mt-2">Complete your order with cash on delivery</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Shipping Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-gray-900 font-semibold text-lg">
                  <MapPin className="h-5 w-5 mr-2" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <Input
                      value={shippingAddress.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <Input
                      value={shippingAddress.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="01XXXXXXXXX or +880XXXXXXXXX"
                      pattern="^(\+880|880|0)?1[3-9]\d{8}$"
                      title="Please enter a valid Bangladeshi phone number (e.g., 01712345678 or +8801712345678)"
                    />
                    {shippingAddress.phone && !isValidBangladeshiPhone(shippingAddress.phone) && (
                      <p className="text-red-500 text-xs mt-1">
                        Please enter a valid Bangladeshi phone number
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <Input
                    type="email"
                    value={shippingAddress.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter your email address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address *
                  </label>
                  <Input
                    value={shippingAddress.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Enter your complete address"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <select
                      value={shippingAddress.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-900"
                    >
                      <option value="">Select City</option>
                      <option value="Dhaka">Dhaka</option>
                      <option value="Chittagong">Chittagong</option>
                      <option value="Sylhet">Sylhet</option>
                      <option value="Rajshahi">Rajshahi</option>
                      <option value="Khulna">Khulna</option>
                      <option value="Barisal">Barisal</option>
                      <option value="Rangpur">Rangpur</option>
                      <option value="Mymensingh">Mymensingh</option>
                      <option value="Comilla">Comilla</option>
                      <option value="Gazipur">Gazipur</option>
                      <option value="Narayanganj">Narayanganj</option>
                      <option value="Savar">Savar</option>
                      <option value="Tongi">Tongi</option>
                      <option value="Cox&apos;s Bazar">Cox&apos;s Bazar</option>
                      <option value="Bogura">Bogura</option>
                      <option value="Jessore">Jessore</option>
                      <option value="Dinajpur">Dinajpur</option>
                      <option value="Pabna">Pabna</option>
                      <option value="Kushtia">Kushtia</option>
                      <option value="Faridpur">Faridpur</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State *
                    </label>
                    <Input
                      value={shippingAddress.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      placeholder="State"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pincode *
                    </label>
                    <Input
                      value={shippingAddress.pincode}
                      onChange={(e) => handleInputChange('pincode', e.target.value)}
                      placeholder="4-digit postal code (e.g., 1000)"
                      pattern="\d{4}"
                      maxLength={4}
                      title="Please enter a valid 4-digit Bangladeshi postal code"
                    />
                    {shippingAddress.pincode && !isValidBangladeshiPincode(shippingAddress.pincode) && (
                      <p className="text-red-500 text-xs mt-1">
                        Please enter a valid 4-digit postal code
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-gray-900 font-semibold text-lg">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border border-gray-200 rounded-lg p-4 bg-green-50">
                  <div className="flex items-center">
                    <Truck className="h-6 w-6 text-green-600 mr-3" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Cash on Delivery</h3>
                      <p className="text-sm text-gray-600">Pay when your order is delivered</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="text-gray-900 font-semibold text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Order Items */}
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3">
                      <div className="relative h-12 w-12 flex-shrink-0 rounded-lg overflow-hidden">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 line-clamp-1">
                          {item.title}
                        </h4>
                        <p className="text-xs text-gray-500">
                          Qty: {item.quantity} × {formatPrice(item.price)}
                        </p>
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold border-t border-gray-200 pt-2">
                    <span className="text-gray-900">Total</span>
                    <span className="text-gray-900">{formatPrice(finalTotal)}</span>
                  </div>
                </div>

                <Button 
                  onClick={handlePlaceOrder}
                  disabled={loading || !validateForm()}
                  className="w-full bg-pink-600 hover:bg-pink-700"
                >
                  {loading ? 'Placing Order...' : 'Place Order'}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  By placing your order, you agree to our terms and conditions.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}