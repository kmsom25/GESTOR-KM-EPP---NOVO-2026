/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { supabase } from '../lib/supabase';
import { EventData } from '../types';

const LOCAL_EVENTS_KEY = 'km_local_events_fallback';

const isOfflineOnly = (): boolean => {
  return localStorage.getItem('km_offline_mode') === 'true';
};

const getLocalEvents = (): EventData[] => {
  try {
    const raw = localStorage.getItem(LOCAL_EVENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

const saveLocalEvents = (events: EventData[]) => {
  localStorage.setItem(LOCAL_EVENTS_KEY, JSON.stringify(events));
};

export const eventService = {
  getEvents: async (): Promise<EventData[]> => {
    if (isOfflineOnly()) {
      console.warn('Working in OFFLINE MODE. Loading events from LocalStorage.');
      return getLocalEvents();
    }

    try {
      const { data: events, error } = await supabase
        .from('events')
        .select('*, expenses(*)')
        .order('event_date', { ascending: false });

      if (error) throw error;

      const formattedEvents = (events || []).map(e => ({
        id: e.id,
        name: e.name,
        date: e.event_date,
        time: e.event_time,
        revenue: Number(e.revenue),
        divider: Number(e.divider),
        invoiceTaxPercentage: Number(e.invoice_tax_percentage),
        observations: e.observations || '',
        createdAt: e.created_at ? new Date(e.created_at).getTime() : Date.now(),
        expenses: (e.expenses || []).map((ex: any) => ({
          id: ex.id,
          label: ex.label,
          value: Number(ex.value),
          paidKM: ex.paid_km,
          paidMS: ex.paid_ms
        }))
      }));

      // Cache a copy locally in case of future network failures
      try {
        saveLocalEvents(formattedEvents);
      } catch (e) {
        // ignore storage space errors
      }

      return formattedEvents;
    } catch (e) {
      console.error('Error loading events from Supabase, attempting local fallback', e);
      // If we got a network fetch failure but we want to survive it, we can fallback
      const cached = getLocalEvents();
      if (cached.length > 0) {
        console.warn('Returning cached events due to connection error');
        return cached;
      }
      throw e;
    }
  },

  saveEvent: async (event: EventData) => {
    if (isOfflineOnly()) {
      const local = getLocalEvents();
      const eventId = event.id || crypto.randomUUID();
      const newEvent = { ...event, id: eventId, createdAt: event.createdAt || Date.now() };
      
      const index = local.findIndex(e => e.id === eventId);
      if (index >= 0) {
        local[index] = newEvent;
      } else {
        local.unshift(newEvent);
      }
      saveLocalEvents(local);
      return eventId;
    }

    const eventPayload = {
      name: event.name,
      event_date: event.date || null,
      event_time: event.time || null,
      revenue: event.revenue,
      divider: event.divider,
      invoice_tax_percentage: event.invoiceTaxPercentage,
      observations: event.observations,
    };

    try {
      let eventId = event.id;

      // If event.id exists and looks like a UUID (Supabase uses UUIDs), we update
      if (eventId && eventId.length === 36) { 
        const { error } = await supabase
          .from('events')
          .update(eventPayload)
          .eq('id', eventId);
        
        if (error) throw error;

        // Delete existing expenses to re-insert current ones (simple sync)
        await supabase.from('expenses').delete().eq('event_id', eventId);
      } else {
        const { data, error } = await supabase
          .from('events')
          .insert(eventPayload)
          .select()
          .single();
        
        if (error) throw error;
        eventId = data.id;
      }

      if (event.expenses && event.expenses.length > 0) {
        const expensesPayload = event.expenses.map(ex => ({
          event_id: eventId,
          label: ex.label,
          value: ex.value,
          paid_km: ex.paidKM,
          paid_ms: ex.paidMS
        }));

        const { error: expError } = await supabase
          .from('expenses')
          .insert(expensesPayload);
        
        if (expError) throw expError;
      }

      // Also update local cache
      try {
        const local = getLocalEvents();
        const updatedObj = { ...event, id: eventId };
        const idx = local.findIndex(e => e.id === eventId);
        if (idx >= 0) {
          local[idx] = updatedObj;
        } else {
          local.unshift(updatedObj);
        }
        saveLocalEvents(local);
      } catch (e) {}

      return eventId;
    } catch (error) {
      console.error('Error saving event to Supabase', error);
      throw error;
    }
  },

  deleteEvent: async (id: string) => {
    if (!id) return;

    if (isOfflineOnly()) {
      const local = getLocalEvents();
      const filtered = local.filter(e => e.id !== id);
      saveLocalEvents(filtered);
      return;
    }

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      console.log(`Event ${id} deleted successfully`);

      // Delete from local cache too
      try {
        const local = getLocalEvents();
        saveLocalEvents(local.filter(e => e.id !== id));
      } catch (e) {}
    } catch (error) {
      console.error('Error deleting event from Supabase', error);
      throw error;
    }
  }
};

