import React, { useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import ListingCard from '../components/ListingCard';
import { User as UserIcon, Calendar, Package, ShieldCheck, ExternalLink, Camera, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const ProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isOwnProfile = !id || parseInt(id) === currentUser?.id;
  const userId = isOwnProfile ? currentUser?.id : parseInt(id);

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const endpoint = isOwnProfile ? '/users/me' : `/users/${userId}`;
      const response = await api.get(endpoint);
      return response.data;
    },
    enabled: !!userId,
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post('/users/me/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
      toast.success('Profile picture updated!');
    },
    onError: () => {
      toast.error('Failed to upload image');
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadMutation.mutate(e.target.files[0]);
    }
  };

  const { data: listings, isLoading: listingsLoading } = useQuery({
    queryKey: ['user-listings', userId],
    queryFn: async () => {
      const endpoint = isOwnProfile ? '/users/me/listings' : `/users/${userId}/listings`;
      const response = await api.get(endpoint);
      return response.data;
    },
    enabled: !!userId,
  });

  if (userLoading) return (
    <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
      <div className="h-64 bg-slate-200 rounded-[2.5rem]" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-80 bg-slate-200 rounded-[2rem]" />
        ))}
      </div>
    </div>
  );

  if (!user) return (
    <div className="text-center py-32 space-y-6">
      <div className="inline-flex p-6 rounded-full bg-slate-100 text-slate-400 mb-4">
        <UserIcon className="w-12 h-12" />
      </div>
      <h2 className="text-3xl font-black text-slate-900 tracking-tight">Profile unavailable</h2>
      <p className="text-slate-500 max-w-xs mx-auto">The user profile you're looking for doesn't exist or is private.</p>
      <button onClick={() => navigate('/')} className="btn-primary">Return to Marketplace</button>
    </div>
  );

  const userImageUrl = (user && user.profile_image) 
    ? `http://localhost:8000/static/images/${user.profile_image}` 
    : null;

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      {}
      <section className="card !rounded-[2.5rem] !shadow-2xl !shadow-indigo-50 border-none relative overflow-hidden">
        <div className="h-40 bg-indigo-600 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          </div>
        </div>
        <div className="px-10 pb-10">
          <div className="relative flex flex-col md:flex-row md:items-end -mt-16 md:space-x-8">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-32 h-32 md:w-44 md:h-44 bg-white rounded-[2.5rem] shadow-2xl flex items-center justify-center text-indigo-600 border-[6px] border-white relative z-10 group overflow-hidden"
            >
              {userImageUrl ? (
                <img src={userImageUrl} alt={user.username} className="w-full h-full object-cover rounded-[2.1rem]" />
              ) : (
                <UserIcon className="w-16 h-16 md:w-24 md:h-24" />
              )}
              
              {isOwnProfile && (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-[2px]"
                >
                  {uploadMutation.isPending ? (
                    <Loader2 className="w-8 h-8 animate-spin" />
                  ) : (
                    <>
                      <Camera className="w-8 h-8 mb-1" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Update Photo</span>
                    </>
                  )}
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*"
              />
            </motion.div>
            
            <div className="mt-6 md:mt-0 flex-grow pb-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">{user.username}</h1>
                {user.is_admin && (
                  <span className="bg-indigo-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-indigo-200">
                    Staff Member
                  </span>
                )}
                <div className="flex items-center text-green-600 font-black text-[10px] uppercase tracking-widest bg-green-50 px-3 py-1 rounded-full border border-green-100">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
                  Verified Seller
                </div>
              </div>
              
              <div className="flex flex-wrap gap-6 mt-4 text-slate-500 font-bold text-sm uppercase tracking-wider">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-indigo-400" />
                  Joined {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </div>
              </div>
            </div>

            {isOwnProfile && (
              <div className="mt-8 md:mt-0 flex gap-3 pb-2">
                <button 
                  onClick={() => navigate('/create-listing')}
                  className="btn-primary !px-8 !py-4 flex items-center shrink-0"
                >
                  <Package className="w-5 h-5 mr-2" />
                  Post New Ad
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center space-y-1">
          <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Live Listings</p>
          <p className="text-3xl font-black text-indigo-600">{listings?.length || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center space-y-1">
          <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Account Type</p>
          <p className="text-3xl font-black text-slate-900">{user.is_admin ? 'Staff' : 'Standard'}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center space-y-1">
          <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Profile Status</p>
          <p className="text-3xl font-black text-green-500">Active</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center space-y-1">
          <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Member Since</p>
          <p className="text-3xl font-black text-indigo-600 uppercase tracking-tighter">{new Date(user.created_at).getFullYear()}</p>
        </div>
      </div>

      {}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-1.5 bg-indigo-600 rounded-full"></div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {isOwnProfile ? 'Your Marketplace Activity' : `${user.username}'s Collection`}
            </h2>
          </div>
          {!isOwnProfile && (
            <button className="text-xs font-black text-indigo-600 uppercase tracking-widest flex items-center hover:text-indigo-700">
              Report User <ExternalLink className="w-3 h-3 ml-2" />
            </button>
          )}
        </div>

        {listingsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-slate-100 h-80 rounded-3xl animate-pulse"></div>
            ))}
          </div>
        ) : listings?.length === 0 ? (
          <div className="bg-white p-20 rounded-[2.5rem] text-center border border-dashed border-slate-200">
            <Package className="w-16 h-16 text-slate-200 mx-auto mb-6" />
            <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight">No active listings</h3>
            <p className="text-slate-400 font-medium">This collection is currently empty. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.map((listing: any) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
