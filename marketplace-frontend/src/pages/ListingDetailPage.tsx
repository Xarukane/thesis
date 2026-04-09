import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { 
  MapPin, Tag, MessageCircle, User as UserIcon, 
  ArrowLeft, ShieldCheck, Edit2, Share2, Heart,
  ExternalLink, Clock, X
} from 'lucide-react';
import DeleteListingButton from '../components/DeleteListingButton';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const ListingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  const { data: listing, isLoading, isError } = useQuery({
    queryKey: ['listing', id],
    queryFn: async () => {
      const response = await api.get(`/listings/${id}`);
      return response.data;
    },
    enabled: !!id,
  });

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast.success(!isFavorite ? 'Added to favorites' : 'Removed from favorites');
  };

  if (isLoading) return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
      <div className="h-8 bg-slate-200 rounded-lg w-32 animate-pulse" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 h-[500px] bg-slate-200 rounded-3xl animate-pulse" />
        <div className="space-y-6">
          <div className="h-64 bg-slate-200 rounded-3xl animate-pulse" />
          <div className="h-32 bg-slate-200 rounded-3xl animate-pulse" />
        </div>
      </div>
    </div>
  );

  if (isError || !listing) return (
    <div className="text-center py-32 space-y-6">
      <div className="inline-flex p-6 rounded-full bg-red-50 text-red-400 mb-4">
        <X className="w-12 h-12" />
      </div>
      <h2 className="text-3xl font-black text-slate-900 tracking-tight">Listing not found</h2>
      <p className="text-slate-500 max-w-xs mx-auto">The item you're looking for might have been sold or removed.</p>
      <button 
        onClick={() => navigate('/')} 
        className="btn-primary"
      >
        Explore Marketplace
      </button>
    </div>
  );

  const isOwner = user?.id === listing.owner.id;
  const isAdmin = user?.is_admin;
  const canModify = isOwner || isAdmin;

  const images = listing.images.length > 0 
    ? listing.images.map((img: any) => `http://localhost:8000/static/images/${img.filename}`)
    : ['https://via.placeholder.com/800x600?text=No+Image+Available'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-slate-500 hover:text-indigo-600 transition-colors font-bold text-sm uppercase tracking-widest"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Listings
        </button>
        
        <div className="flex items-center space-x-3">
          <button 
            onClick={toggleFavorite}
            className={`p-3 rounded-xl border transition-all ${isFavorite ? 'bg-pink-50 border-pink-100 text-pink-500' : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'}`}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
          <button 
            onClick={handleShare}
            className="p-3 rounded-xl border border-slate-200 bg-white text-slate-400 hover:bg-slate-50 transition-all"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Images & Description */}
        <div className="lg:col-span-2 space-y-10">
          <div className="card !rounded-[2.5rem] !shadow-2xl !shadow-indigo-50 border-none relative group">
            <div className="relative h-[400px] md:h-[600px] bg-slate-50">
              <AnimatePresence mode="wait">
                <motion.img 
                  key={activeImageIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  src={images[activeImageIndex]} 
                  alt={listing.title}
                  className="w-full h-full object-contain p-4"
                />
              </AnimatePresence>
            </div>
            
            {images.length > 1 && (
              <div className="p-6 flex gap-3 overflow-x-auto border-t border-slate-100/60 bg-white/50 backdrop-blur-md">
                {images.map((img: string, idx: number) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-24 h-24 rounded-2xl overflow-hidden border-4 transition-all shrink-0 active:scale-90 ${
                      activeImageIndex === idx ? 'border-indigo-600 shadow-xl' : 'border-white opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} className="w-full h-full object-cover" alt={`Thumb ${idx}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-slate-200/60">
            <div className="flex items-center space-x-2 text-indigo-600 mb-6">
              <div className="h-1 w-12 bg-indigo-600 rounded-full"></div>
              <h2 className="text-sm font-black uppercase tracking-[0.2em]">Product Overview</h2>
            </div>
            <p className="text-slate-600 text-lg whitespace-pre-wrap leading-relaxed font-medium">
              {listing.description}
            </p>
          </div>
        </div>

        {/* Right Column: Sticky Sidebar */}
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-indigo-100/20 border border-slate-200/60 sticky top-28">
            <div className="flex items-center justify-between mb-6">
              <div className="inline-flex items-center space-x-2 bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                <Tag className="w-3 h-3" />
                <span>{listing.category}</span>
              </div>
              <div className="flex items-center text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <Clock className="w-3 h-3 mr-1" />
                {new Date(listing.created_at).toLocaleDateString()}
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 leading-tight tracking-tight">
              {listing.title}
            </h1>
            
            <div className="flex items-center text-slate-500 mb-8 font-bold">
              <MapPin className="w-5 h-5 mr-2 text-indigo-400" />
              {listing.location}
            </div>

            <div className="text-5xl font-black text-indigo-600 mb-10 tracking-tighter">
              ${listing.price.toLocaleString()}
            </div>

            <div className="space-y-4">
              {!isOwner ? (
                <Link 
                  to="/chat" 
                  state={{ receiverId: listing.owner.id, listingId: listing.id }}
                  className="w-full bg-indigo-600 text-white flex items-center justify-center py-5 rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 active:scale-[0.98]"
                >
                  <MessageCircle className="w-6 h-6 mr-3" />
                  Chat with Seller
                </Link>
              ) : (
                <div className="bg-slate-100 p-5 rounded-2xl text-slate-500 font-bold text-center border border-slate-200 uppercase text-xs tracking-widest">
                  This is your listing
                </div>
              )}
              
              <button className="w-full bg-white border-2 border-slate-100 text-slate-900 flex items-center justify-center py-5 rounded-2xl font-black text-lg hover:bg-slate-50 transition-all active:scale-[0.98]">
                <ExternalLink className="w-5 h-5 mr-3 text-slate-400" />
                Safety Tips
              </button>
            </div>

            {/* Seller Profile Card Integration */}
            <div className="mt-10 pt-10 border-t border-slate-100">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Seller Details</h3>
              <div className="flex items-center group">
                <Link to={`/profile/${listing.owner.id}`} className="relative">
                  <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner group-hover:bg-indigo-100 transition-colors">
                    <UserIcon className="w-8 h-8" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-green-500 w-5 h-5 rounded-full border-4 border-white"></div>
                </Link>
                <div className="ml-4 flex-grow">
                  <Link to={`/profile/${listing.owner.id}`} className="font-black text-slate-900 text-lg hover:text-indigo-600 transition-colors leading-tight block">
                    {listing.owner.username}
                  </Link>
                  <div className="flex items-center text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                    <ShieldCheck className="w-3.5 h-3.5 mr-1 text-green-500" />
                    Verified Member
                  </div>
                </div>
              </div>
            </div>

            {/* Admin/Owner Actions */}
            {canModify && (
              <div className="mt-10 bg-slate-900 p-6 rounded-[2rem] text-white shadow-2xl shadow-slate-900/20">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6 text-center">Manage Your Listing</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Link 
                    to={`/edit-listing/${listing.id}`}
                    className="bg-white/10 hover:bg-white/20 text-white py-4 rounded-xl font-black text-sm flex items-center justify-center transition-all active:scale-95"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                  </Link>
                  <div className="bg-red-500/10 hover:bg-red-500/20 text-red-500 py-4 rounded-xl font-black text-sm flex items-center justify-center transition-all active:scale-95 cursor-pointer">
                    <DeleteListingButton listingId={listing.id} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetailPage;
