import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { Trash2, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface DeleteListingButtonProps {
  listingId: number;
  onSuccess?: () => void;
}

const DeleteListingButton: React.FC<DeleteListingButtonProps> = ({ listingId, onSuccess }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/listings/${listingId}`);
    },
    onSuccess: () => {
      // Invalidate all listing-related queries to ensure UI is fresh everywhere
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['user-listings'] });
      queryClient.invalidateQueries({ queryKey: ['listing', listingId] });
      
      toast.success('Listing permanently removed');
      setShowConfirm(false);
      
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: () => {
      toast.error('Failed to delete listing');
    }
  });

  if (showConfirm) {
    return (
      <AnimatePresence>
        <motion.div 
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center space-x-1"
        >
          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 disabled:opacity-50 shadow-lg shadow-red-200 transition-all active:scale-90"
            title="Confirm Delete"
          >
            {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setShowConfirm(false)}
            className="bg-slate-100 text-slate-500 p-2 rounded-lg hover:bg-slate-200 transition-all active:scale-90"
            title="Cancel"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        setShowConfirm(true);
      }}
      className="text-slate-400 hover:text-red-600 transition-all p-2 hover:bg-red-50 rounded-lg active:scale-90"
      title="Delete Listing"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
};

export default DeleteListingButton;
