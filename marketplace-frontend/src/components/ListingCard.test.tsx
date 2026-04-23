import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../context/AuthContext';
import ListingCard from './ListingCard';

const queryClient = new QueryClient();

const mockListing = {
  id: 1,
  title: 'Test Listing',
  description: 'Test description for a nice item',
  price: 100,
  category: 'General',
  location: 'New York',
  images: [],
  owner: { id: 1, username: 'testuser' },
};

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          {ui}
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

describe('ListingCard', () => {
  it('renders listing title, price, and location', () => {
    renderWithProviders(<ListingCard listing={mockListing} />);
    expect(screen.getByText('Test Listing')).toBeInTheDocument();
    expect(screen.getByText('$100')).toBeInTheDocument();
    expect(screen.getByText('New York')).toBeInTheDocument();
  });

  it('renders the owner username', () => {
    renderWithProviders(<ListingCard listing={mockListing} />);
    expect(screen.getByText('testuser')).toBeInTheDocument();
  });

  it('renders the fallback image when no images are provided', () => {
    renderWithProviders(<ListingCard listing={mockListing} />);
    const img = screen.getByAltText('Test Listing');
    expect(img).toHaveAttribute('src', 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?q=80&w=2070&auto=format&fit=crop');
  });
});
