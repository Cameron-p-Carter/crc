// src/services/api.ts
import { LoginRequest, RegisterRequest, User, LoginResponse } from '../types/user';
import { Event, CreateEventRequest, UpdateEventRequest, SearchEventsParams } from '../types/event';
import { Transaction, WalletBalance, DepositRequest, DepositResponse } from '../types/wallet';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_URL environment variable is not defined");
}

// User endpoints
export const getUsers = async (): Promise<User[]> => {
  const response = await fetch(`${BASE_URL}/users`);
  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }
  return await response.json();
};

export const getUser = async (id: number): Promise<User> => {
  const response = await fetch(`${BASE_URL}/users/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch user");
  }
  return await response.json();
};

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await fetch(`${BASE_URL}/users/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to login');
  }

  return await response.json();
};

export const register = async (data: RegisterRequest): Promise<User> => {
  const response = await fetch(`${BASE_URL}/users/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to register');
  }

  return await response.json();
};

// Event endpoints
export const getAllEvents = async (): Promise<Event[]> => {
  const response = await fetch(`${BASE_URL}/events`);
  if (!response.ok) {
    throw new Error("Failed to fetch events");
  }
  return await response.json();
};

export const getEvent = async (id: number): Promise<Event> => {
  const response = await fetch(`${BASE_URL}/events/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch event");
  }
  return await response.json();
};

export const createEvent = async (data: CreateEventRequest): Promise<Event> => {
  const response = await fetch(`${BASE_URL}/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create event');
  }

  return await response.json();
};

export const updateEvent = async (id: number, data: UpdateEventRequest): Promise<Event> => {
  const response = await fetch(`${BASE_URL}/events/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update event');
  }

  return await response.json();
};

export const deleteEvent = async (id: number): Promise<void> => {
  const response = await fetch(`${BASE_URL}/events/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete event');
  }
};

export const searchEvents = async (params: SearchEventsParams): Promise<Event[]> => {
  const queryParams = new URLSearchParams();
  
  if (params.category) queryParams.append('category', params.category);
  if (params.startDate) queryParams.append('startDate', params.startDate);
  if (params.endDate) queryParams.append('endDate', params.endDate);
  if (params.location) queryParams.append('location', params.location);
  if (params.minPrice !== undefined) queryParams.append('minPrice', params.minPrice.toString());
  if (params.maxPrice !== undefined) queryParams.append('maxPrice', params.maxPrice.toString());

  const response = await fetch(`${BASE_URL}/events/search?${queryParams}`);
  if (!response.ok) {
    throw new Error("Failed to search events");
  }
  return await response.json();
};

// Registration endpoints
export interface CreateRegistrationRequest {
  userId: number;
  eventId: number;
  ticketId: number;
}

export interface Registration {
  id: number;
  userId: number;
  eventId: number;
  ticketId: number;
  status: string;
  registrationDate: string;
  event: Event;
  ticket: {
    id: number;
    type: string;
    price: number;
    benefits?: string;
  };
  payment?: {
    id: number;
    amount: number;
    status: string;
    paymentDate: string;
  };
}

export const createRegistration = async (data: CreateRegistrationRequest): Promise<Registration> => {
  const response = await fetch(`${BASE_URL}/registrations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create registration');
  }

  return await response.json();
};

export const getRegistration = async (id: number): Promise<Registration> => {
  const response = await fetch(`${BASE_URL}/registrations/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch registration");
  }
  return await response.json();
};

export const getUserRegistrations = async (userId: number): Promise<Registration[]> => {
  const response = await fetch(`${BASE_URL}/registrations/user/${userId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch registrations");
  }
  return await response.json();
};

export const getEventRegistrations = async (eventId: number): Promise<Registration[]> => {
  const response = await fetch(`${BASE_URL}/registrations/event/${eventId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch event registrations");
  }
  return await response.json();
};

// Wallet endpoints
export const getWalletBalance = async (userId: number): Promise<WalletBalance> => {
  const response = await fetch(`${BASE_URL}/wallet/${userId}/balance`);
  if (!response.ok) {
    throw new Error("Failed to fetch wallet balance");
  }
  return await response.json();
};

export const depositToWallet = async (userId: number, data: DepositRequest): Promise<DepositResponse> => {
  const response = await fetch(`${BASE_URL}/wallet/${userId}/deposit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to deposit to wallet');
  }

  return await response.json();
};

export const getTransactionHistory = async (userId: number): Promise<Transaction[]> => {
  const response = await fetch(`${BASE_URL}/wallet/${userId}/transactions`);
  if (!response.ok) {
    throw new Error("Failed to fetch transaction history");
  }
  return await response.json();
};

// Payment endpoints
export interface CreatePaymentRequest {
  registrationId: number;
}

export interface Payment {
  id: number;
  registrationId: number;
  amount: number;
  status: string;
  paymentDate: string;
}

export const createPayment = async (data: CreatePaymentRequest): Promise<Payment> => {
  const response = await fetch(`${BASE_URL}/payments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to process payment');
  }

  return await response.json();
};
