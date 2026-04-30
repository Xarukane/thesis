import React from 'react';
import { MapPin, Tag, Edit2, ChevronRight, User as UserIcon, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DeleteListingButton from './DeleteListingButton';
import { motion } from 'framer-motion';

interface Image {
  id: number;
  filename: string;
}

interface Owner {
  id: number;
  username: string;
}

interface Listing {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  location: string;
  images: Image[];
  owner: Owner;
}

const ListingCard: React.FC<{ listing: Listing }> = ({ listing }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const imageUrl = listing.images.length > 0 
    ? `http://localhost:8000/static/images/${listing.images[0].filename}`
    : 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?q=80&w=2070&auto=format&fit=crop';

  const isOwner = user?.id === listing.owner.id;
  const isAdmin = user?.is_admin;
  const canModify = isOwner || isAdmin;

  const handleCardClick = () => {
    navigate(`/listings/${listing.id}`);
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -10, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onClick={handleCardClick}
      className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(79,70,229,0.15)] transition-all duration-500 border border-slate-200/50 flex flex-col h-full relative group cursor-pointer overflow-hidden"
    >
      <div className="relative h-64 w-full overflow-hidden bg-slate-50">
        <motion.img 
          src={imageUrl} 
          alt={listing.title} 
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.15 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
        
        {}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {isOwner && (
            <div className="bg-indigo-600 text-white px-4 py-1.5 rounded-full font-black text-[9px] uppercase tracking-[0.15em] shadow-xl flex items-center backdrop-blur-md">
              <Sparkles className="w-3 h-3 mr-1.5 fill-current" />
              Owner
            </div>
          )}
          <div className="bg-white/90 backdrop-blur-xl text-slate-900 px-4 py-1.5 rounded-full font-black text-[9px] uppercase tracking-[0.15em] shadow-sm flex items-center border border-white/50">
            <Tag className="w-3 h-3 mr-1.5 text-indigo-600" />
            {listing.category}
          </div>
        </div>

        <div className="absolute bottom-4 right-4 bg-slate-900/90 backdrop-blur-xl text-white px-5 py-2 rounded-2xl font-black text-base shadow-2xl border border-white/10 group-hover:bg-indigo-600 group-hover:scale-110 transition-all duration-300">
          ${listing.price.toLocaleString()}
        </div>
        
        {}
        {canModify && (
          <div 
            className="absolute top-3 right-3 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white/95 backdrop-blur-md p-1.5 rounded-xl shadow-xl flex flex-col space-y-1 items-center border border-slate-100">
              <Link 
                to={`/edit-listing/${listing.id}`}
                className="text-slate-400 hover:text-indigo-600 p-2 hover:bg-indigo-50 rounded-lg transition-colors"
                title="Edit Listing"
              >
                <Edit2 className="w-4 h-4" />
              </Link>
              <div className="w-8 h-px bg-slate-100" />
              <DeleteListingButton listingId={listing.id} />
            </div>
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-lg font-black text-slate-900 mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors leading-tight tracking-tight">
          {listing.title}
        </h3>
        <p className="text-sm text-slate-500 mb-6 line-clamp-2 flex-grow font-medium leading-relaxed">
          {listing.description}
        </p>
        
        <div className="flex flex-wrap gap-y-2 gap-x-4 mb-6">
          <div className="flex items-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <MapPin className="w-3.5 h-3.5 mr-1.5 text-slate-300" />
            {listing.location}
          </div>
          <div className="flex items-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <UserIcon className="w-3.5 h-3.5 mr-1.5 text-slate-300" />
            {listing.owner.username}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
          <span className="text-[10px] text-slate-300 font-black uppercase tracking-widest">
            ID: #{listing.id}
          </span>
          <div className="flex items-center text-indigo-600 font-black text-xs uppercase tracking-widest group-hover:translate-x-1 transition-transform">
            Details
            <ChevronRight className="w-4 h-4 ml-1" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ListingCard;
