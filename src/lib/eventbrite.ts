/**
 * Eventbrite MCP API Integration
 * Handles event synchronization between Eventbrite and NAMC member portal
 */

import axios, { AxiosInstance } from 'axios';
import { logger } from './logger';

export interface EventbriteEvent {
  id: string;
  name: {
    text: string;
    html: string;
  };
  description: {
    text: string;
    html: string;
  };
  start: {
    timezone: string;
    local: string;
    utc: string;
  };
  end: {
    timezone: string;
    local: string;
    utc: string;
  };
  url: string;
  capacity?: number;
  status: string;
  currency: string;
  online_event: boolean;
  venue_id?: string;
  category_id?: string;
  subcategory_id?: string;
  logo?: {
    url: string;
  };
}

export interface EventbriteAttendee {
  id: string;
  profile: {
    name: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  status: string;
  event_id: string;
  order_id: string;
  checked_in: boolean;
  checked_in_at?: string;
}

export interface EventbriteOrganization {
  id: string;
  name: string;
  locale: string;
}

export class EventbriteClient {
  private client: AxiosInstance;
  private apiKey: string;
  private organizationId?: string;

  constructor(apiKey: string, organizationId?: string) {
    this.apiKey = apiKey;
    this.organizationId = organizationId;
    
    this.client = axios.create({
      baseURL: 'https://www.eventbriteapi.com/v3',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    // Add request/response interceptors for logging
    this.client.interceptors.request.use(
      (config) => {
        logger.info('Eventbrite API Request', {
          method: config.method,
          url: config.url,
          params: config.params,
        });
        return config;
      },
      (error) => {
        logger.error('Eventbrite API Request Error', error);
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response) => {
        logger.info('Eventbrite API Response', {
          status: response.status,
          url: response.config.url,
        });
        return response;
      },
      (error) => {
        logger.error('Eventbrite API Response Error', {
          status: error.response?.status,
          url: error.config?.url,
          data: error.response?.data,
        });
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get user's organizations
   */
  async getOrganizations(): Promise<EventbriteOrganization[]> {
    try {
      const response = await this.client.get('/users/me/organizations/');
      return response.data.organizations || [];
    } catch (error) {
      logger.error('Failed to fetch organizations', error);
      throw new Error('Failed to fetch Eventbrite organizations');
    }
  }

  /**
   * Get events for organization
   */
  async getEvents(options: {
    status?: 'draft' | 'live' | 'started' | 'ended' | 'completed' | 'canceled';
    orderBy?: 'start_asc' | 'start_desc' | 'created_asc' | 'created_desc';
    page?: number;
    expand?: string[];
  } = {}): Promise<EventbriteEvent[]> {
    try {
      if (!this.organizationId) {
        throw new Error('Organization ID is required to fetch events');
      }

      const params: any = {
        'order_by': options.orderBy || 'start_asc',
        'page': options.page || 1,
      };

      if (options.status) {
        params.status = options.status;
      }

      if (options.expand && options.expand.length > 0) {
        params.expand = options.expand.join(',');
      }

      const response = await this.client.get(
        `/organizations/${this.organizationId}/events/`,
        { params }
      );

      return response.data.events || [];
    } catch (error) {
      logger.error('Failed to fetch events', error);
      throw new Error('Failed to fetch Eventbrite events');
    }
  }

  /**
   * Get specific event by ID
   */
  async getEvent(eventId: string, expand?: string[]): Promise<EventbriteEvent> {
    try {
      const params: any = {};
      if (expand && expand.length > 0) {
        params.expand = expand.join(',');
      }

      const response = await this.client.get(`/events/${eventId}/`, { params });
      return response.data;
    } catch (error) {
      logger.error('Failed to fetch event', { eventId, error });
      throw new Error(`Failed to fetch Eventbrite event: ${eventId}`);
    }
  }

  /**
   * Get attendees for an event
   */
  async getEventAttendees(
    eventId: string,
    options: {
      status?: 'attending' | 'not_attending' | 'unpaid' | 'incomplete';
      page?: number;
      changedSince?: string;
    } = {}
  ): Promise<EventbriteAttendee[]> {
    try {
      const params: any = {
        page: options.page || 1,
      };

      if (options.status) {
        params.status = options.status;
      }

      if (options.changedSince) {
        params.changed_since = options.changedSince;
      }

      const response = await this.client.get(
        `/events/${eventId}/attendees/`,
        { params }
      );

      return response.data.attendees || [];
    } catch (error) {
      logger.error('Failed to fetch event attendees', { eventId, error });
      throw new Error(`Failed to fetch attendees for event: ${eventId}`);
    }
  }

  /**
   * Create a new event
   */
  async createEvent(eventData: {
    name: string;
    description?: string;
    start: string; // ISO date string
    end: string;   // ISO date string
    timezone: string;
    currency: string;
    online_event?: boolean;
    capacity?: number;
    venue_id?: string;
    category_id?: string;
    subcategory_id?: string;
  }): Promise<EventbriteEvent> {
    try {
      const payload = {
        event: {
          name: {
            html: eventData.name,
          },
          description: eventData.description ? {
            html: eventData.description,
          } : undefined,
          start: {
            timezone: eventData.timezone,
            utc: eventData.start,
          },
          end: {
            timezone: eventData.timezone,
            utc: eventData.end,
          },
          currency: eventData.currency,
          online_event: eventData.online_event || false,
          capacity: eventData.capacity,
          venue_id: eventData.venue_id,
          category_id: eventData.category_id,
          subcategory_id: eventData.subcategory_id,
        },
      };

      const response = await this.client.post('/events/', payload);
      return response.data;
    } catch (error) {
      logger.error('Failed to create event', { eventData, error });
      throw new Error('Failed to create Eventbrite event');
    }
  }

  /**
   * Update an existing event
   */
  async updateEvent(
    eventId: string,
    updates: Partial<{
      name: string;
      description: string;
      start: string;
      end: string;
      timezone: string;
      capacity: number;
      status: string;
    }>
  ): Promise<EventbriteEvent> {
    try {
      const payload: any = { event: {} };

      if (updates.name) {
        payload.event.name = { html: updates.name };
      }

      if (updates.description) {
        payload.event.description = { html: updates.description };
      }

      if (updates.start || updates.end || updates.timezone) {
        payload.event.start = {};
        payload.event.end = {};
        
        if (updates.timezone) {
          payload.event.start.timezone = updates.timezone;
          payload.event.end.timezone = updates.timezone;
        }
        
        if (updates.start) {
          payload.event.start.utc = updates.start;
        }
        
        if (updates.end) {
          payload.event.end.utc = updates.end;
        }
      }

      if (updates.capacity !== undefined) {
        payload.event.capacity = updates.capacity;
      }

      if (updates.status) {
        payload.event.status = updates.status;
      }

      const response = await this.client.post(`/events/${eventId}/`, payload);
      return response.data;
    } catch (error) {
      logger.error('Failed to update event', { eventId, updates, error });
      throw new Error(`Failed to update Eventbrite event: ${eventId}`);
    }
  }

  /**
   * Delete an event
   */
  async deleteEvent(eventId: string): Promise<void> {
    try {
      await this.client.delete(`/events/${eventId}/`);
      logger.info('Event deleted successfully', { eventId });
    } catch (error) {
      logger.error('Failed to delete event', { eventId, error });
      throw new Error(`Failed to delete Eventbrite event: ${eventId}`);
    }
  }

  /**
   * Test API connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.client.get('/users/me/');
      logger.info('Eventbrite API connection successful');
      return true;
    } catch (error) {
      logger.error('Eventbrite API connection failed', error);
      return false;
    }
  }

  /**
   * Get webhook events (for setting up webhooks)
   */
  async getWebhookEvents(): Promise<string[]> {
    return [
      'event.created',
      'event.updated',
      'event.published',
      'event.unpublished',
      'attendee.checked_in',
      'attendee.checked_out',
      'attendee.updated',
      'order.placed',
      'order.refunded',
    ];
  }
}

// Factory function to create Eventbrite client
export function createEventbriteClient(apiKey?: string, organizationId?: string): EventbriteClient {
  const key = apiKey || process.env.EVENTBRITE_API_KEY;
  const orgId = organizationId || process.env.EVENTBRITE_ORGANIZATION_ID;

  if (!key) {
    throw new Error('Eventbrite API key is required');
  }

  return new EventbriteClient(key, orgId);
}

// Default export
export default EventbriteClient;