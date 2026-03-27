import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

const supabaseUrl = `https://${projectId}.supabase.co`;
export const supabase = createClient(supabaseUrl, publicAnonKey);

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'buyer' | 'seller' | 'admin';
}

export interface Car {
  id: string;
  sellerId: string;
  sellerName: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  condition: 'New' | 'Used - Excellent' | 'Used - Good' | 'Used - Fair';
  startingPrice: number;
  buyItNowPrice?: number;
  auctionEndTime: string;
  imageUrl: string;
  status: 'active' | 'sold' | 'expired';
  createdAt: string;
}

export interface Bid {
  id: string;
  carId: string;
  buyerId: string;
  buyerName: string;
  amount: number;
  createdAt: string;
}

export interface Order {
  id: string;
  carId: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  status: 'pending_payment' | 'paid' | 'completed';
  createdAt: string;
  updatedAt: string;
}

// Auth functions
export async function signup(email: string, password: string, name: string, role: 'buyer' | 'seller') {
  try {
    const { data: authData, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
        }
      }
    });

    if (error) {
      console.error('Signup error:', error);
      throw error;
    }

    if (authData.session?.user) {
      saveUserProfile({
        id: authData.session.user.id,
        email,
        name,
        role,
      });
    }

    return authData.session;
  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  }
}

let mockDemoSession: any = null;

const DEMO_USERS: Record<string, { id: string, name: string, role: string }> = {
  'demo@buyer.com': { id: 'demo-buyer-123', name: 'Demo Buyer', role: 'buyer' },
  'demo@seller.com': { id: 'demo-seller-456', name: 'Premium Motors', role: 'seller' }
};

export async function signin(email: string, password: string) {
  try {
    if (DEMO_USERS[email] && password === 'password123') {
      const demoUser = DEMO_USERS[email];
      mockDemoSession = {
        access_token: 'mock-token-123',
        user: {
          id: demoUser.id,
          email: email,
          user_metadata: {
            name: demoUser.name,
            role: demoUser.role
          }
        }
      };

      saveUserProfile({
        id: demoUser.id,
        email,
        name: demoUser.name,
        role: demoUser.role as 'buyer' | 'seller',
      });

      return mockDemoSession;
    }

    const { data: { session }, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      console.error('Sign in error:', error);
      throw error;
    }

    if (session?.user) {
      saveUserProfile({
        id: session.user.id,
        email,
        name: session.user.user_metadata?.name || 'User',
        role: session.user.user_metadata?.role || 'buyer',
      });
    }

    return session;
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
}

export async function signout() {
  if (mockDemoSession) {
    mockDemoSession = null;
    return;
  }

  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Sign out error:', error);
    throw error;
  }
}

export async function getCurrentSession() {
  if (mockDemoSession) {
    return mockDemoSession;
  }

  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Get session error:', error);
    return null;
  }
  return session;
}

// Mock Databases
function getSavedItems<T>(key: string): T[] {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
  }
  return [];
}

function saveItems<T>(key: string, items: T[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(items));
  }
}

export function saveUserProfile(profile: UserProfile) {
  const profiles = getSavedItems<UserProfile>('mockUsers');
  const existingIndex = profiles.findIndex(p => p.id === profile.id);
  if (existingIndex >= 0) {
    profiles[existingIndex] = profile;
  } else {
    profiles.push(profile);
  }
  saveItems('mockUsers', profiles);
}

// Car functions
export async function createCarListing(
  make: string,
  model: string,
  year: number,
  mileage: number,
  condition: Car['condition'],
  startingPrice: number,
  buyItNowPrice: number | undefined,
  auctionDays: number,
  imageUrl: string
): Promise<Car> {
  const session = await getCurrentSession();
  const sellerId = session?.user?.id || 'guest';
  const sellerName = session?.user?.user_metadata?.name || 'Seller';

  const endTime = new Date();
  endTime.setDate(endTime.getDate() + auctionDays);

  const newCar: Car = {
    id: 'car-' + Date.now() + Math.random().toString(36).substr(2, 5),
    sellerId,
    sellerName,
    make,
    model,
    year,
    mileage,
    condition,
    startingPrice,
    buyItNowPrice,
    auctionEndTime: endTime.toISOString(),
    imageUrl,
    status: 'active',
    createdAt: new Date().toISOString()
  };

  const cars = getSavedItems<Car>('mockCars');
  cars.push(newCar);
  saveItems('mockCars', cars);
  return newCar;
}

export async function getCars(): Promise<Car[]> {
  return getSavedItems<Car>('mockCars');
}

export async function getCar(id: string): Promise<Car> {
  const cars = getSavedItems<Car>('mockCars');
  const car = cars.find(c => c.id === id);
  if (!car) throw new Error('Car not found');
  return car;
}

export async function updateCarStatus(id: string, status: Car['status']): Promise<void> {
  const cars = getSavedItems<Car>('mockCars');
  const index = cars.findIndex(c => c.id === id);
  if (index !== -1) {
    cars[index].status = status;
    saveItems('mockCars', cars);
  }
}

export async function clearSellerCars(): Promise<void> {
  const session = await getCurrentSession();
  const sellerId = session?.user?.id;
  if (!sellerId) throw new Error('Not authenticated');
  
  const cars = getSavedItems<Car>('mockCars');
  const remainingCars = cars.filter(c => c.sellerId !== sellerId);
  saveItems('mockCars', remainingCars);
}

// Bid functions
export async function placeBid(carId: string, amount: number): Promise<Bid> {
  const session = await getCurrentSession();
  const buyerId = session?.user?.id || 'guest';
  const buyerName = session?.user?.user_metadata?.name || 'Buyer';

  const car = await getCar(carId);
  if (car.status !== 'active') throw new Error('Auction is not active');
  
  const bids = getSavedItems<Bid>('mockBids');
  const carBids = bids.filter(b => b.carId === carId);
  const highestBid = carBids.reduce((max, bid) => Math.max(max, bid.amount), car.startingPrice);

  if (amount <= highestBid) {
    throw new Error('Bid must be higher than the current highest bid');
  }

  const newBid: Bid = {
    id: 'bid-' + Date.now() + Math.random().toString(36).substr(2, 5),
    carId,
    buyerId,
    buyerName,
    amount,
    createdAt: new Date().toISOString()
  };

  bids.push(newBid);
  saveItems('mockBids', bids);

  // Check if it hits Buy It Now
  if (car.buyItNowPrice && amount >= car.buyItNowPrice) {
    await updateCarStatus(carId, 'sold');
    await createOrder(carId, newBid.id);
  }

  return newBid;
}

export async function getCarBids(carId: string): Promise<Bid[]> {
  const bids = getSavedItems<Bid>('mockBids');
  return bids.filter(b => b.carId === carId).sort((a, b) => b.amount - a.amount);
}

export async function getUserBids(): Promise<Bid[]> {
  const session = await getCurrentSession();
  const buyerId = session?.user?.id || 'guest';
  const bids = getSavedItems<Bid>('mockBids');
  return bids.filter(b => b.buyerId === buyerId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// Order functions
export async function createOrder(carId: string, bidId: string): Promise<Order> {
  const car = await getCar(carId);
  const bids = getSavedItems<Bid>('mockBids');
  const bid = bids.find(b => b.id === bidId);

  if (!bid) throw new Error('Bid not found');

  const newOrder: Order = {
    id: 'ord-' + Date.now() + Math.random().toString(36).substr(2, 5),
    carId,
    buyerId: bid.buyerId,
    sellerId: car.sellerId,
    amount: bid.amount,
    status: 'pending_payment',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const orders = getSavedItems<Order>('mockOrders');
  orders.push(newOrder);
  saveItems('mockOrders', orders);

  return newOrder;
}

export async function getOrders(): Promise<Order[]> {
  const session = await getCurrentSession();
  const userId = session?.user?.id;
  const role = session?.user?.user_metadata?.role;
  const orders = getSavedItems<Order>('mockOrders');

  if (role === 'buyer') {
    return orders.filter(o => o.buyerId === userId);
  } else if (role === 'seller') {
    return orders.filter(o => o.sellerId === userId);
  }
  return orders;
}

export async function updateOrderStatus(orderId: string, status: Order['status']): Promise<Order> {
  const orders = getSavedItems<Order>('mockOrders');
  const index = orders.findIndex(o => o.id === orderId);
  if (index === -1) throw new Error('Order not found');

  orders[index].status = status;
  orders[index].updatedAt = new Date().toISOString();
  saveItems('mockOrders', orders);

  return orders[index];
}
