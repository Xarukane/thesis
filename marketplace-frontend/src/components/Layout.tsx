import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, LogOut, User as UserIcon, MessageCircle, PlusCircle, Menu, X } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Toaster position="top-right" toastOptions={{
        className: 'rounded-xl font-bold text-sm',
        duration: 3000,
      }} />
      
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2 group">
                <div className="bg-indigo-600 p-1.5 rounded-lg group-hover:rotate-12 transition-transform duration-300 shadow-indigo-200 shadow-lg">
                  <ShoppingCart className="w-5 h-5 text-white" />
                </div>
                <span className="font-black text-xl tracking-tight text-slate-900 uppercase">Market</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              <Link to="/" className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${isActive('/') ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-100'}`}>
                Browse
              </Link>
              {user ? (
                <>
                  <Link to="/create-listing" className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center ${isActive('/create-listing') ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-100'}`}>
                    <PlusCircle className="w-4 h-4 mr-1.5" />
                    Post Ad
                  </Link>
                  <Link to="/chat" className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center ${isActive('/chat') ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-100'}`}>
                    <MessageCircle className="w-4 h-4 mr-1.5" />
                    Chats
                  </Link>
                  <div className="h-6 w-px bg-slate-200 mx-2" />
                  <Link to="/profile" className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center ${isActive('/profile') ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-100'}`}>
                    <UserIcon className="w-4 h-4 mr-1.5 text-slate-400" />
                    <span>{user.username}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="ml-2 bg-indigo-600 text-white hover:bg-indigo-700 px-5 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 active:scale-95 transition-all"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t border-slate-100 overflow-hidden shadow-2xl"
            >
              <div className="px-4 pt-2 pb-6 space-y-1">
                <Link
                  to="/"
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-4 py-3 rounded-xl text-base font-bold ${isActive('/') ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  Browse Marketplace
                </Link>
                {user ? (
                  <>
                    <Link
                      to="/create-listing"
                      onClick={() => setIsMenuOpen(false)}
                      className={`block px-4 py-3 rounded-xl text-base font-bold ${isActive('/create-listing') ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                      Post an Ad
                    </Link>
                    <Link
                      to="/chat"
                      onClick={() => setIsMenuOpen(false)}
                      className={`block px-4 py-3 rounded-xl text-base font-bold ${isActive('/chat') ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                      My Chats
                    </Link>
                    <Link
                      to="/profile"
                      onClick={() => setIsMenuOpen(false)}
                      className={`block px-4 py-3 rounded-xl text-base font-bold ${isActive('/profile') ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                      My Profile
                    </Link>
                    <div className="pt-4 mt-4 border-t border-slate-100">
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-3 rounded-xl text-base font-bold text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-5 h-5 mr-2" />
                        Sign Out
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-4 py-3 rounded-xl text-base font-bold text-slate-600 hover:bg-slate-50"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-4 py-3 rounded-xl text-base font-bold bg-indigo-600 text-white"
                    >
                      Register
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>

      <footer className="bg-white border-t border-slate-200/60 mt-auto py-12 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="text-center md:text-left">
            <Link to="/" className="inline-flex items-center space-x-2 mb-4">
              <div className="bg-indigo-600 p-1 rounded-lg">
                <ShoppingCart className="w-4 h-4 text-white" />
              </div>
              <span className="font-black text-lg tracking-tight uppercase">Market</span>
            </Link>
            <p className="text-slate-500 text-sm max-w-xs mx-auto md:mx-0 font-medium">
              The modern way to buy and sell items in your local community. Fast, secure, and reliable.
            </p>
          </div>
          <div className="text-center md:text-right text-slate-400 text-xs font-bold uppercase tracking-widest">
            &copy; {new Date().getFullYear()} Thesis Marketplace &bull; Built with FastAPI & React
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
