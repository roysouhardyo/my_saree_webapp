'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Package,
  DollarSign,
  AlertTriangle,
  Eye,
  ArrowLeft
} from 'lucide-react';
import Image from 'next/image';
import { useNotification } from '@/contexts/NotificationContext';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  category: string;
  images: string[];
  stock: number;
  isActive: boolean;
  createdAt: string;
}

export default function AdminProducts() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { addNotification } = useNotification();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const categories = ['cotton', 'silk', 'designer', 'wedding'];

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

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const deletedProduct = products.find(p => p._id === productId);
        setProducts(products.filter(p => p._id !== productId));
        
        addNotification({
          type: 'success',
          title: 'Product Deleted',
          message: `${deletedProduct?.name || 'Product'} has been successfully deleted`,
          duration: 4000,
        });
      } else {
        addNotification({
          type: 'error',
          title: 'Delete Failed',
          message: 'Failed to delete product. Please try again.',
          duration: 4000,
        });
      }
    } catch (error) {
      console.error('Delete error:', error);
      addNotification({
        type: 'error',
        title: 'Delete Failed',
        message: 'Failed to delete product. Please try again.',
        duration: 4000,
      });
    }
  };

  const handleToggleActive = async (productId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (response.ok) {
        const product = products.find(p => p._id === productId);
        setProducts(products.map(p => 
          p._id === productId ? { ...p, isActive: !isActive } : p
        ));
        
        addNotification({
          type: 'success',
          title: `Product ${!isActive ? 'Activated' : 'Deactivated'}`,
          message: `${product?.name || 'Product'} has been ${!isActive ? 'activated' : 'deactivated'}`,
          duration: 3000,
        });
      } else {
        addNotification({
          type: 'error',
          title: 'Update Failed',
          message: 'Failed to update product status. Please try again.',
          duration: 4000,
        });
      }
    } catch (error) {
      console.error('Toggle active error:', error);
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update product status. Please try again.',
        duration: 4000,
      });
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = (product.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (product.description?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
                <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
                <p className="text-gray-600">Manage your saree inventory</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
          <div className="flex flex-col md:flex-row gap-4">
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
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div key={product._id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="relative h-48">
                <Image
                  src={product.images[0] || '/placeholder-saree.svg'}
                  alt={product.name || 'Product image'}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-2 right-2 flex gap-1">
                  {product.stock <= 5 && (
                    <span className="bg-red-500 text-white px-2 py-1 rounded text-xs">
                      Low Stock
                    </span>
                  )}
                  {!product.isActive && (
                    <span className="bg-gray-500 text-white px-2 py-1 rounded text-xs">
                      Inactive
                    </span>
                  )}
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1 truncate">{product.name}</h3>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-900">
                      ₹{product.discountPrice || product.price}
                    </span>
                    {product.discountPrice && (
                      <span className="text-sm text-gray-500 line-through">
                        ₹{product.price}
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-600">Stock: {product.stock}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 capitalize">{product.category}</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => router.push(`/products/${product._id}`)}
                      className="p-1 text-gray-600 hover:text-blue-600"
                      title="View Product"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setEditingProduct(product)}
                      className="p-1 text-gray-600 hover:text-green-600"
                      title="Edit Product"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleToggleActive(product._id, product.isActive)}
                      className={`p-1 ${product.isActive ? 'text-green-600 hover:text-gray-600' : 'text-gray-600 hover:text-green-600'}`}
                      title={product.isActive ? 'Deactivate' : 'Activate'}
                    >
                      <Package className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product._id)}
                      className="p-1 text-gray-600 hover:text-red-600"
                      title="Delete Product"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>

      {/* Add/Edit Product Modal */}
      {(showAddModal || editingProduct) && (
        <ProductModal
          product={editingProduct}
          onClose={() => {
            setShowAddModal(false);
            setEditingProduct(null);
          }}
          onSave={() => {
            fetchProducts();
            setShowAddModal(false);
            setEditingProduct(null);
          }}
        />
      )}
    </div>
  );
}

// Product Modal Component
function ProductModal({ 
  product, 
  onClose, 
  onSave 
}: { 
  product: Product | null; 
  onClose: () => void; 
  onSave: () => void; 
}) {
  const { addNotification } = useNotification();
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || 0,
    discountPrice: product?.discountPrice || 0,
    category: product?.category || 'cotton',
    stock: product?.stock || 0,
    isActive: product?.isActive ?? true,
    images: product?.images || [],
  });
  const [loading, setLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>(product?.images || []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate file types and sizes
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      addNotification({
        type: 'warning',
        title: 'File Upload Warning',
        message: 'Some files were rejected. Please upload only images under 5MB.'
      });
    }

    // Limit to 5 images total
    const totalImages = imagePreviews.length + validFiles.length;
    if (totalImages > 5) {
      addNotification({
        type: 'warning',
        title: 'Image Limit',
        message: 'Maximum 5 images allowed per product.'
      });
      return;
    }

    setImageFiles(prev => [...prev, ...validFiles]);

    // Create preview URLs
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create FormData for file upload
      const submitData = new FormData();
      
      // Add form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'images') {
          submitData.append(key, value.toString());
        }
      });

      // Add image files
      imageFiles.forEach((file, index) => {
        submitData.append(`images`, file);
      });

      // If editing and there are existing images, preserve them
      if (product && product.images) {
        product.images.forEach((imageUrl, index) => {
          if (imagePreviews.includes(imageUrl)) {
            submitData.append('existingImages', imageUrl);
          }
        });
      }

      const url = product 
        ? `/api/admin/products/${product._id}`
        : '/api/admin/products';
      
      const method = product ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        body: submitData, // Use FormData instead of JSON
      });

      if (response.ok) {
        const savedProduct = await response.json();
        addNotification({
          type: 'success',
          title: product ? 'Product Updated' : 'Product Created',
          message: `${formData.name} has been ${product ? 'updated' : 'created'} successfully`,
          duration: 4000,
        });
        onSave();
      } else {
        const errorData = await response.json();
        addNotification({
          type: 'error',
          title: 'Save Failed',
          message: `Failed to save product: ${errorData.message || 'Unknown error'}`,
          duration: 4000,
        });
      }
    } catch (error) {
      console.error('Save error:', error);
      addNotification({
        type: 'error',
        title: 'Save Failed',
        message: 'Failed to save product. Please try again.',
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20 relative">
        {/* Glass effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/20 to-transparent rounded-2xl pointer-events-none"></div>
        <div className="relative z-10">
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          {product ? 'Edit Product' : 'Add New Product'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-white/30 rounded-xl focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 bg-white/50 backdrop-blur-sm transition-all duration-200 placeholder-gray-500"
              placeholder="Enter product name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 border border-white/30 rounded-xl focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 bg-white/50 backdrop-blur-sm transition-all duration-200 placeholder-gray-500 resize-none text-gray-800"
              placeholder="Enter product description"
            />
          </div>

          {/* Image Upload Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Images (Max 5)
            </label>
            
            {/* Image Upload Input */}
            <div className="mb-4">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="w-full px-4 py-3 border-2 border-dashed border-white/40 rounded-xl bg-white/30 backdrop-blur-sm hover:bg-white/40 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center text-gray-600 hover:text-gray-800"
              >
                <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="text-sm font-medium">Click to upload images</span>
                <span className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP up to 5MB each</span>
              </label>
            </div>

            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Product image preview ${index + 1}`}
                      className="w-full h-20 object-cover rounded-lg border border-white/30"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (₹)
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full px-4 py-3 border border-white/30 rounded-xl focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 bg-white/80 backdrop-blur-sm transition-all duration-200 placeholder-gray-500 text-gray-800"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount Price (₹)
              </label>
              <input
                type="number"
                min="0"
                value={formData.discountPrice}
                onChange={(e) => setFormData({ ...formData, discountPrice: Number(e.target.value) })}
                className="w-full px-4 py-3 border border-white/30 rounded-xl focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 bg-white/80 backdrop-blur-sm transition-all duration-200 placeholder-gray-500 text-gray-800"
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 border border-white/30 rounded-xl focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 bg-white/80 backdrop-blur-sm transition-all duration-200 text-gray-800"
              >
                <option value="cotton">Cotton</option>
                <option value="silk">Silk</option>
                <option value="designer">Designer</option>
                <option value="wedding">Wedding</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock Quantity
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                className="w-full px-4 py-3 border border-white/30 rounded-xl focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 bg-white/80 backdrop-blur-sm transition-all duration-200 placeholder-gray-500 text-gray-800"
                placeholder="0"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="h-5 w-5 text-pink-600 focus:ring-pink-500/50 border-white/30 rounded-lg bg-white/50 backdrop-blur-sm transition-all duration-200"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
              Product is active
            </label>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-white/20">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-700 bg-white/60 backdrop-blur-sm rounded-xl hover:bg-white/80 transition-all duration-200 border border-white/30 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-xl hover:from-pink-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg font-medium"
            >
              {loading ? 'Saving...' : (product ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}