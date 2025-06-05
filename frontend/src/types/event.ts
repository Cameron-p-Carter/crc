export enum EventCategory {
  CONFERENCE = 'CONFERENCE',
  CORPORATE_MEETING = 'CORPORATE_MEETING',
  SOCIAL_GATHERING = 'SOCIAL_GATHERING',
  MUSIC_CONCERT = 'MUSIC_CONCERT',
  NETWORKING_SESSION = 'NETWORKING_SESSION'
}

export enum TicketType {
  GENERAL = 'GENERAL',
  VIP = 'VIP'
}

export interface Ticket {
  id: number;
  type: TicketType;
  price: number;
  quantity: number;
  remainingCount: number;
  benefits?: string;
  createdAt: string;
  eventId: number;
}

export interface Event {
  id: number;
  title: string;
  description: string;
  category: EventCategory;
  startDate: string;
  endDate: string;
  location: string;
  createdAt: string;
  updatedAt: string;
  maxCapacity: number;
  currentCapacity: number;
  isActive: boolean;
  organizerId: number;
  organizer: {
    id: number;
    name: string;
    email: string;
  };
  tickets: Ticket[];
}

export interface CreateEventRequest {
  title: string;
  description: string;
  category: EventCategory;
  startDate: string;
  endDate: string;
  location: string;
  maxCapacity: number;
  organizerId: number;
  tickets: {
    type: TicketType;
    price: number;
    quantity: number;
    benefits?: string;
  }[];
}

export interface UpdateEventRequest {
  title?: string;
  description?: string;
  category?: EventCategory;
  startDate?: string;
  endDate?: string;
  location?: string;
  maxCapacity?: number;
  isActive?: boolean;
}

export interface SearchEventsParams {
  category?: EventCategory;
  startDate?: string;
  endDate?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
}
