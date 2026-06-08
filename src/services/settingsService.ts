/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { supabase } from '../lib/supabase';
import { AppSettings } from '../types';

const defaultSettings: AppSettings = {
  defaultTaxPercentage: 6,
  defaultDivider: 2,
  businessName: 'SOM GESTOR EPP'
};

const isOfflineOnly = (): boolean => {
  return localStorage.getItem('km_offline_mode') === 'true';
};

export const settingsService = {
  getSettings: async (): Promise<AppSettings> => {
    // Get Supabase credentials from LocalStorage first (fallback if not in env)
    const stored = localStorage.getItem('km_som_settings');
    let localSupabaseData = { url: '', key: '' };
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        localSupabaseData = {
          url: parsed.supabaseUrl || '',
          key: parsed.supabaseKey || ''
        };
      } catch (e) {}
    }

    // Load other custom offline settings
    const storedAppSettings = localStorage.getItem('km_local_settings_fallback');
    let mergedDefaults = { ...defaultSettings };
    if (storedAppSettings) {
      try {
        const parsed = JSON.parse(storedAppSettings);
        mergedDefaults = { ...mergedDefaults, ...parsed };
      } catch (e) {}
    }

    if (isOfflineOnly()) {
      return {
        ...mergedDefaults,
        supabaseUrl: localSupabaseData.url,
        supabaseKey: localSupabaseData.key
      };
    }

    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('id', 1)
        .single();

      if (error || !data) {
        return { 
          ...mergedDefaults, 
          supabaseUrl: localSupabaseData.url, 
          supabaseKey: localSupabaseData.key 
        };
      }

      const onlineSettings = {
        defaultTaxPercentage: Number(data.default_tax_percentage),
        defaultDivider: Number(data.default_divider),
        businessName: data.business_name,
        supabaseUrl: localSupabaseData.url,
        supabaseKey: localSupabaseData.key
      };

      // Save to local fallback cache too
      localStorage.setItem('km_local_settings_fallback', JSON.stringify({
        defaultTaxPercentage: onlineSettings.defaultTaxPercentage,
        defaultDivider: onlineSettings.defaultDivider,
        businessName: onlineSettings.businessName
      }));

      return onlineSettings;
    } catch (error) {
      console.error('Error loading settings from Supabase', error);
      return { 
        ...mergedDefaults, 
        supabaseUrl: localSupabaseData.url, 
        supabaseKey: localSupabaseData.key 
      };
    }
  },

  saveSettings: async (settings: AppSettings) => {
    // Save Supabase credentials to LocalStorage immediately
    localStorage.setItem('km_som_settings', JSON.stringify({
      supabaseUrl: (settings.supabaseUrl || '').trim(),
      supabaseKey: (settings.supabaseKey || '').trim()
    }));

    // Cache generic settings locally immediately too
    localStorage.setItem('km_local_settings_fallback', JSON.stringify({
      defaultTaxPercentage: settings.defaultTaxPercentage,
      defaultDivider: settings.defaultDivider,
      businessName: settings.businessName
    }));

    if (isOfflineOnly()) {
      console.log('Settings saved to LocalStorage (Offline Mode)');
      return;
    }

    try {
      const { error } = await supabase
        .from('settings')
        .upsert({
          id: 1,
          default_tax_percentage: settings.defaultTaxPercentage,
          default_divider: settings.defaultDivider,
          business_name: settings.businessName,
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error saving settings to Supabase', error);
    }
  }
};
