import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { STATIC_URL } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Save, CheckCircle, ArrowLeft, Trash2, Camera, Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const EditListingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'General',
    location: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  
  const { data: listing, isLoading: fetchingListing } = useQuery({
    queryKey: ['listing', id],
    queryFn: async () => {
      const response = await api.get(`/listings/${id}`);
      return response.data;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (listing) {
      setFormData({
        title: listing.title,
        description: listing.description,
        price: listing.price.toString(),
        category: listing.category,
        location: listing.location,
      });
    }
  }, [listing]);

  useEffect(() => {
    
    if (listing && user && !user.is_admin && listing.owner.id !== user.id) {
      toast.error('Not authorized to edit this listing');
      navigate('/');
    }
  }, [listing, user, navigate]);

  
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      await api.post(`/listings/${id}/images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listing', id] });
      toast.success('Image uploaded successfully');
    },
    onError: () => toast.error('Failed to upload image'),
  });

  
  const deleteImageMutation = useMutation({
    mutationFn: async (imageId: number) => {
      await api.delete(`/listings/${id}/images/${imageId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listing', id] });
      toast.success('Image removed');
    },
    onError: () => toast.error('Failed to remove image'),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      files.forEach(file => uploadMutation.mutate(file));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.put(`/listings/${id}`, {
        ...formData,
        price: parseFloat(formData.price),
      });

      setSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['listing', id] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      setTimeout(() => navigate(`/listings/${id}`), 2000);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to update listing');
      setLoading(false);
    }
  };

  if (authLoading || fetchingListing) return (
    <div className="flex justify-center items-center h-[60vh]">
      <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
    </div>
  );

  if (!user) {
    navigate('/login');
    return null;
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-16 h-16 text-green-500" />
        </div>
        <h2 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">Listing Updated!</h2>
        <p className="text-slate-500 font-medium">Your changes have been saved. Redirecting to listing...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-slate-500 hover:text-indigo-600 transition-colors font-black text-xs uppercase tracking-[0.2em]"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Go Back
        </button>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Edit Your Ad</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {}
        <div className="lg:col-span-2 order-2 lg:order-1">
          <form onSubmit={handleSubmit} className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-indigo-100/20 border border-slate-200/60 space-y-8">
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
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                <>
                  <Save className="w-6 h-6 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </form>
        </div>

        {}
        <div className="lg:col-span-1 order-1 lg:order-2 space-y-6">
          <div className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-indigo-100/20 border border-slate-200/60 flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center">
                <ImageIcon className="w-4 h-4 mr-2 text-indigo-600" />
                Media Gallery
              </h3>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors"
                title="Add Photos"
              >
                <Camera className="w-5 h-5" />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                multiple 
                accept="image/*" 
              />
            </div>

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              <AnimatePresence>
                {listing?.images.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-3xl">
                    <Upload className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">No photos yet</p>
                  </div>
                ) : (
                  listing?.images.map((img: any) => (
                    <motion.div 
                      key={img.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="relative group rounded-2xl overflow-hidden aspect-video bg-slate-50 border border-slate-100 shadow-sm"
                    >
                      <img 
                        src={`${STATIC_URL}/images/${img.filename}`} 
                        alt="Listing" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                        <button
                          onClick={() => deleteImageMutation.mutate(img.id)}
                          className="bg-red-500 text-white p-3 rounded-2xl hover:bg-red-600 shadow-xl transition-all active:scale-90"
                        >
                          {deleteImageMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            <div className="mt-6 p-4 bg-indigo-50 rounded-2xl text-[10px] font-bold text-indigo-600 uppercase tracking-[0.1em] leading-relaxed">
              💡 Tip: Upload high-quality photos to increase your chances of a quick sale!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditListingPage;
