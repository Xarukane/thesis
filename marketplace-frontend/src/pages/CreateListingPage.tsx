import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Upload, X, CheckCircle, Camera, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CreateListingPage: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'General',
    location: '',
  });
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (authLoading) return <div className="text-center py-20">Loading...</div>;
  if (!user) {
    navigate('/login');
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setImages(prev => [...prev, ...newFiles]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      
      const listingResponse = await api.post('/listings/', {
        ...formData,
        price: parseFloat(formData.price),
      });

      const listingId = listingResponse.data.id;

      
      if (images.length > 0) {
        await Promise.all(images.map(async (img) => {
          const imageFormData = new FormData();
          imageFormData.append('file', img);
          return api.post(`/listings/${listingId}/images`, imageFormData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
        }));
      }

      setSuccess(true);
      setTimeout(() => navigate('/'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create listing. Please try again.');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <CheckCircle className="w-20 h-20 text-green-500 mb-4 animate-bounce" />
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Listing Created!</h2>
        <p className="text-gray-600">Your item has been posted successfully. Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Create New Listing</h1>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-indigo-100/20 border border-slate-200/60 space-y-8">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold flex items-center border border-red-100">
                <X className="w-5 h-5 mr-2" />
                {error}
              </div>
            )}

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Item Title</label>
                <input
                  name="title"
                  type="text"
                  required
                  placeholder="What are you selling?"
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder-slate-400 text-slate-900 font-semibold"
                  value={formData.title}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Price ($)</label>
                  <input
                    name="price"
                    type="number"
                    required
                    placeholder="0.00"
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder-slate-400 text-slate-900 font-semibold"
                    value={formData.price}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                  <select
                    name="category"
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-slate-900 font-bold appearance-none cursor-pointer"
                    value={formData.category}
                    onChange={handleChange}
                  >
                    <option value="General">General</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Vehicles">Vehicles</option>
                    <option value="Real Estate">Real Estate</option>
                    <option value="Clothing">Clothing</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Location</label>
                <input
                  name="location"
                  type="text"
                  required
                  placeholder="e.g. New York, NY"
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder-slate-400 text-slate-900 font-semibold"
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                <textarea
                  name="description"
                  required
                  rows={6}
                  placeholder="Tell buyers more about your item..."
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none resize-none placeholder-slate-400 text-slate-900 font-medium"
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-5 rounded-[1.5rem] font-black text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? 'Publishing...' : 'Publish Listing'}
            </button>
          </div>
        </div>

        {}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-indigo-100/20 border border-slate-200/60 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center">
                <Camera className="w-4 h-4 mr-2 text-indigo-600" />
                Product Media
              </h3>
              <label className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors cursor-pointer">
                <Upload className="w-5 h-5" />
                <input 
                  type="file" 
                  className="hidden" 
                  onChange={handleImageChange} 
                  multiple 
                  accept="image/*" 
                />
              </label>
            </div>

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              <AnimatePresence>
                {images.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-3xl">
                    <Upload className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">No photos added</p>
                  </div>
                ) : (
                  images.map((img, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="relative group rounded-2xl overflow-hidden aspect-video bg-slate-50 border border-slate-100 shadow-sm"
                    >
                      <img 
                        src={URL.createObjectURL(img)} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="bg-red-500 text-white p-3 rounded-2xl hover:bg-red-600 shadow-xl transition-all active:scale-90"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="absolute bottom-2 left-2 right-2">
                        <p className="text-[10px] text-white bg-black/50 px-2 py-1 rounded backdrop-blur-md truncate">
                          {img.name}
                        </p>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            <div className="mt-6 p-4 bg-indigo-50 rounded-2xl text-[10px] font-bold text-indigo-600 uppercase tracking-[0.1em] leading-relaxed">
              💡 Tip: Listings with multiple clear photos sell up to 3x faster!
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateListingPage;
