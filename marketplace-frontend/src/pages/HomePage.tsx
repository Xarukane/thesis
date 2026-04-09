import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import ListingCard from '../components/ListingCard';
import { Search, Filter, X, Sparkles, TrendingUp, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const HomePage: React.FC = () => {
  const [filters, setFilters] = useState({
    category: '',
    location: '',
    min_price: '',
    max_price: '',
    search: '',
  });

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { data: listings, isLoading, isError, refetch } = useQuery({
    queryKey: ['listings', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.location) params.append('location', filters.location);
      if (filters.min_price) params.append('min_price', filters.min_price);
      if (filters.max_price) params.append('max_price', filters.max_price);
      if (filters.search) params.append('search', filters.search);

      const response = await api.get(`/listings/?${params.toString()}`);
      return response.data;
    },
  });

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      location: '',
      min_price: '',
      max_price: '',
      search: '',
    });
  };

  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <section className="relative bg-indigo-900 rounded-[2rem] overflow-hidden py-16 px-8 text-center text-white shadow-2xl">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-0 left-0 w-64 h-64 bg-purple-500 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center space-x-2 bg-indigo-800/50 backdrop-blur-sm border border-indigo-700/50 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            <span>Discover local treasures</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight leading-tight">
            Find everything you need, <br />
            <span className="text-indigo-400">right in your city.</span>
          </h1>
          <p className="text-lg text-indigo-100/80 mb-10 font-medium max-w-xl mx-auto leading-relaxed">
            Join thousands of users buying and selling unique items every day. 
            The most trusted community marketplace.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-sm font-bold border border-white/10">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              <span>Trending Now</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-sm font-bold border border-white/10">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span>Fast Selling</span>
            </div>
          </div>
        </motion.div>
      </section>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Mobile Filter Toggle */}
        <button 
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="lg:hidden flex items-center justify-center bg-indigo-600 text-white p-4 rounded-2xl font-black shadow-lg active:scale-95 transition-all mb-2"
        >
          <Filter className="w-5 h-5 mr-2" />
          {isFilterOpen ? 'Apply Filters' : 'Filter & Search'}
        </button>

        {/* Sidebar Filters */}
        <aside className={`${isFilterOpen ? 'block' : 'hidden'} lg:block lg:w-1/4 shrink-0`}>
          <div className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-slate-200/60 sticky top-24">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-slate-900 flex items-center tracking-tight">
                <Filter className="w-5 h-5 mr-2 text-indigo-600" />
                Customize
              </h3>
              <button 
                onClick={clearFilters}
                className="text-xs text-slate-400 hover:text-indigo-600 font-bold flex items-center transition-colors uppercase tracking-widest"
              >
                <X className="w-3 h-3 mr-1" />
                Reset
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Search Keywords</label>
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                  <input
                    type="text"
                    name="search"
                    placeholder="What are you looking for?"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder-slate-400 text-sm font-medium"
                    value={filters.search}
                    onChange={handleFilterChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                <select
                  name="category"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm font-bold text-slate-700 appearance-none cursor-pointer"
                  value={filters.category}
                  onChange={handleFilterChange}
                >
                  <option value="">All Categories</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Vehicles">Vehicles</option>
                  <option value="Real Estate">Real Estate</option>
                  <option value="Clothing">Clothing</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Location</label>
                <input
                  type="text"
                  name="location"
                  placeholder="e.g. New York"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder-slate-400 text-sm font-medium"
                  value={filters.location}
                  onChange={handleFilterChange}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Min ($)</label>
                  <input
                    type="number"
                    name="min_price"
                    placeholder="0"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder-slate-400 text-sm font-medium"
                    value={filters.min_price}
                    onChange={handleFilterChange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Max ($)</label>
                  <input
                    type="number"
                    name="max_price"
                    placeholder="Any"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder-slate-400 text-sm font-medium"
                    value={filters.max_price}
                    onChange={handleFilterChange}
                  />
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content: Listings Grid */}
        <div className="lg:w-3/4 flex-grow">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white border border-slate-100 rounded-2xl h-[400px] animate-pulse overflow-hidden">
                  <div className="bg-slate-100 h-48 w-full" />
                  <div className="p-4 space-y-4">
                    <div className="h-4 bg-slate-100 rounded w-1/4" />
                    <div className="h-6 bg-slate-100 rounded w-3/4" />
                    <div className="h-4 bg-slate-100 rounded w-full" />
                    <div className="h-10 bg-slate-100 rounded-xl w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="bg-red-50 text-red-600 p-10 rounded-[2rem] text-center border border-red-100"
            >
              <h4 className="text-xl font-black mb-2">Connection Interrupted</h4>
              <p className="font-medium opacity-80">Our servers are taking a quick break. Check back in a moment.</p>
              <button 
                onClick={() => refetch()}
                className="mt-6 bg-red-600 text-white px-8 py-3 rounded-xl font-black shadow-lg shadow-red-200 active:scale-95 transition-all"
              >
                Try Reconnect
              </button>
            </motion.div>
          ) : listings?.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-20 rounded-[2rem] text-center border border-slate-200/60 shadow-sm"
            >
              <div className="text-slate-200 mb-6 flex justify-center">
                <Search className="w-24 h-24 stroke-[1]" />
              </div>
              <h4 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">No results matched your search</h4>
              <p className="text-slate-500 font-medium max-w-xs mx-auto">Try broadening your filters or searching for something else.</p>
              <button onClick={clearFilters} className="mt-8 text-indigo-600 font-black uppercase text-xs tracking-widest hover:text-indigo-700 transition-colors">
                Reset All Filters
              </button>
            </motion.div>
          ) : (
            <AnimatePresence mode="popLayout">
              <motion.div 
                layout
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
              >
                {listings?.map((listing: any) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
