import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AdminPage from './AdminPage';
import api from '../api/axios';


vi.mock('../api/axios');


vi.mock('../context/AuthContext', async () => {
  return {
    useAuth: () => ({
      user: { id: 1, username: 'admin', is_admin: true },
      isLoading: false,
    }),
  };
});

const queryClient = new QueryClient();

const mockUsers = [
  { id: 1, username: 'admin', email: 'admin@test.com', is_admin: true },
  { id: 2, username: 'user1', email: 'user1@test.com', is_admin: false },
];

const mockListings = [
  { id: 1, title: 'Item 1', category: 'Cat 1', price: 10, owner_id: 2 },
];

describe('AdminPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (api.get as any).mockImplementation((url: string) => {
      if (url === '/users/') return Promise.resolve({ data: mockUsers });
      if (url === '/listings/') return Promise.resolve({ data: mockListings });
      return Promise.reject(new Error('not found'));
    });
  });

  it('renders the admin panel title after loading', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AdminPage />
        </BrowserRouter>
      </QueryClientProvider>
    );
    
    expect(await screen.findByText('Admin Panel')).toBeInTheDocument();
  });

  it('renders a list of users', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AdminPage />
        </BrowserRouter>
      </QueryClientProvider>
    );
    
    expect(await screen.findByText('user1')).toBeInTheDocument();
    expect(screen.getByText('admin')).toBeInTheDocument();
  });

  it('allows switching to listings tab', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AdminPage />
        </BrowserRouter>
      </QueryClientProvider>
    );

    const listingsTab = await screen.findByText('Manage Listings');
    fireEvent.click(listingsTab);

    expect(await screen.findByText('Item 1')).toBeInTheDocument();
  });
});
