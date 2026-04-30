import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface User {
  id: number;
  username: string;
  email: string;
  is_admin: boolean;
  created_at: string;
}

interface Listing {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  owner_id: number;
}

const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'listings'>('users');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user && !user.is_admin) {
      navigate('/');
      return;
    }

    const fetchData = async () => {
      try {
        const [usersRes, listingsRes] = await Promise.all([
          api.get('/users/'),
          api.get('/listings/'), 
        ]);
        setUsers(usersRes.data);
        setListings(listingsRes.data);
      } catch (error) {
        toast.error('Failed to fetch admin data.');
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.is_admin) {
      fetchData();
    }
  }, [user, navigate]);

  const handleDeleteUser = async (id: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/users/${id}`);
      setUsers(users.filter(u => u.id !== id));
      toast.success('User deleted successfully.');
    } catch (error) {
      toast.error('Failed to delete user.');
    }
  };

  const handleDeleteListing = async (id: number) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;
    try {
      await api.delete(`/listings/${id}`);
      setListings(listings.filter(l => l.id !== id));
      toast.success('Listing deleted successfully.');
    } catch (error) {
      toast.error('Failed to delete listing.');
    }
  };

  if (isLoading) return <div className="text-center py-10">Loading admin panel...</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold font-heading mb-6">Admin Panel</h1>

      <div className="flex space-x-4 border-b pb-2 mb-6">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-2 px-4 font-medium transition-colors ${activeTab === 'users' ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Manage Users
        </button>
        <button
          onClick={() => setActiveTab('listings')}
          className={`pb-2 px-4 font-medium transition-colors ${activeTab === 'listings' ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Manage Listings
        </button>
      </div>

      {activeTab === 'users' && (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-6 py-4 font-medium text-gray-500">ID</th>
                <th className="px-6 py-4 font-medium text-gray-500">Username</th>
                <th className="px-6 py-4 font-medium text-gray-500">Email</th>
                <th className="px-6 py-4 font-medium text-gray-500">Role</th>
                <th className="px-6 py-4 font-medium text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-500">{u.id}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{u.username}</td>
                  <td className="px-6 py-4 text-gray-600">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.is_admin ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                      {u.is_admin ? 'Admin' : 'User'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {!u.is_admin && (
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                        title="Delete User"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'listings' && (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-6 py-4 font-medium text-gray-500">ID</th>
                <th className="px-6 py-4 font-medium text-gray-500">Title</th>
                <th className="px-6 py-4 font-medium text-gray-500">Category</th>
                <th className="px-6 py-4 font-medium text-gray-500">Price</th>
                <th className="px-6 py-4 font-medium text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {listings.map(l => (
                <tr key={l.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-500">{l.id}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{l.title}</td>
                  <td className="px-6 py-4 text-gray-600">{l.category}</td>
                  <td className="px-6 py-4 text-gray-900 font-medium">${l.price.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDeleteListing(l.id)}
                      className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                      title="Delete Listing"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {listings.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No listings found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
