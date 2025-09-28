'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  Package, 
  AlertTriangle, 
  Plus, 
  Minus, 
  Search, 
  Filter,
  ArrowLeft,
  Edit,
  RefreshCw,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { useNotification } from '@/contexts/NotificationContext';

interface Product {
  _id: string;
  title: string;
  price: number;
  stock: number;
  categories: string[];
  images: string[];
  description: string;
  createdAt: string;
  updatedAt: string;
}

export default function InventoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { addNotification } = useNotification();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [editingStock, setEditingStock] = useState<string | null>(null);
  const [newStockValue, setNewStockValue] = useState<number>(0);

  const categories = ['all', 'sarees', 'lehengas', 'suits', 'accessories'];
  const stockFilters = [
    { value: 'all', label: 'All Products' },
    { value: 'in-stock', label: 'In Stock' },
    { value: 'low-stock', label: 'Low Stock (≤5)' },
    { value: 'out-of-stock', label: 'Out of Stock' }
  ];

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    checkAdminAccess();
  }, [session, status, router]);

  const checkAdminAccess = async () => {
    try {
      const response = await fetch('/api/admin/check');
      if (!response.ok) {
        router.push('/');
        return;
      }
      
      await fetchProducts();
    } catch (error) {
      console.error('Admin access check failed:', error);
      router.push('/');
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/admin/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStockUpdate = async (productId: string, newStock: number) => {
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stock: newStock }),
      });

      if (response.ok) {
        const updatedProduct = await response.json();
        setProducts(products.map(product => 
          product._id === productId ? updatedProduct : product
        ));
        setEditingStock(null);
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Stock updated successfully!'
        });
      } else {
        const error = await response.json();
        addNotification({
          type: 'error',
          title: 'Error',
          message: error.error || 'Failed to update stock'
        });
      }
    } catch (error) {
      console.error('Stock update error:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to update stock'
      });
    }
  };

  const handleQuickStockChange = async (productId: string, change: number) => {
    const product = products.find(p => p._id === productId);
    if (!product) return;

    const newStock = Math.max(0, product.stock + change);
    await handleStockUpdate(productId, newStock);
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { status: 'out-of-stock', color: 'text-red-600 bg-red-100', label: 'Out of Stock' };
    if (stock <= 5) return { status: 'low-stock', color: 'text-yellow-600 bg-yellow-100', label: 'Low Stock' };
    return { status: 'in-stock', color: 'text-green-600 bg-green-100', label: 'In Stock' };
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = (product.title?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.categories.includes(selectedCategory);
    
    let matchesStock = true;
    if (stockFilter === 'in-stock') matchesStock = product.stock > 5;
    else if (stockFilter === 'low-stock') matchesStock = product.stock > 0 && product.stock <= 5;
    else if (stockFilter === 'out-of-stock') matchesStock = product.stock === 0;
    
    return matchesSearch && matchesCategory && matchesStock;
  });

  const totalProducts = products.length;
  const inStockProducts = products.filter(p => p.stock > 5).length;
  const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= 5).length;
  const outOfStockProducts = products.filter(p => p.stock === 0).length;
  const totalStockValue = products.reduce((sum, p) => sum + (p.stock * p.price), 0);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/admin')}
                className="mr-4 p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
                <p className="text-gray-600">Track stock levels and manage inventory</p>
              </div>
            </div>
            <button
              onClick={fetchProducts}
              className="flex items-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Stock</p>
                <p className="text-2xl font-bold text-gray-900">{inStockProducts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold text-gray-900">{lowStockProducts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <TrendingDown className="h-8 w-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                <p className="text-2xl font-bold text-gray-900">{outOfStockProducts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Stock Value</p>
                <p className="text-2xl font-bold text-gray-900">₹{totalStockValue.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-900 bg-white"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-900 bg-white"
              >
                {stockFilters.map(filter => (
                  <option key={filter.value} value={filter.value}>
                    {filter.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product.stock);
                  return (
                    <tr key={product._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            <div className="h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center">
                              <Package className="h-6 w-6 text-gray-400" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{product.title}</div>
                            <div className="text-sm text-gray-500">ID: {product._id.slice(-8)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {product.categories.map((category, index) => (
                            <span key={index} className="px-2 py-1 text-xs font-medium bg-gray-200 text-gray-900 rounded-full border">
                              {category}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{product.price.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingStock === product._id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={newStockValue}
                              onChange={(e) => setNewStockValue(parseInt(e.target.value) || 0)}
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                              min="0"
                            />
                            <button
                              onClick={() => handleStockUpdate(product._id, newStockValue)}
                              className="text-green-600 hover:text-green-700"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => setEditingStock(null)}
                              className="text-red-600 hover:text-red-700"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900">{product.stock}</span>
                            <button
                              onClick={() => {
                                setEditingStock(product._id);
                                setNewStockValue(product.stock);
                              }}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${stockStatus.color}`}>
                          {stockStatus.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleQuickStockChange(product._id, -1)}
                            className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                            disabled={product.stock === 0}
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleQuickStockChange(product._id, 1)}
                            className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}