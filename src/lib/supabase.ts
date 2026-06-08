import { createClient } from '@supabase/supabase-js';

const getSupabaseConfig = () => {
  // Pega das variáveis de ambiente (AI Studio Settings)
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  // Pega do LocalStorage (Interface da App) como fallback
  const storedSettings = localStorage.getItem('km_som_settings');
  let localUrl = '';
  let localKey = '';
  
  if (storedSettings) {
    try {
      const parsed = JSON.parse(storedSettings);
      localUrl = parsed.supabaseUrl;
      localKey = parsed.supabaseKey;
    } catch (e) {
      // ignore
    }
  }

  const sanitizeUrl = (url: string) => {
    let sanitized = url.trim();
    if (!sanitized) return '';
    
    // Remove trailing slashes
    sanitized = sanitized.replace(/\/+$/, '');
    
    // If the user accidentally pasted the full API path, strip it
    sanitized = sanitized.replace(/\/rest\/v1$/, '');
    sanitized = sanitized.replace(/\/auth\/v1$/, '');
    
    return sanitized;
  };

  return {
    url: sanitizeUrl(envUrl || localUrl || ''),
    key: (envKey || localKey || '').trim()
  };
};

const config = getSupabaseConfig();

if (!config.url || !config.key || config.url === '' || config.key === '') {
  console.error('CRITICAL: Supabase credentials missing!');
  console.error('Please go to Settings (Gear Icon) and add:');
  console.error('1. VITE_SUPABASE_URL (ex: https://xyz.supabase.co)');
  console.error('2. VITE_SUPABASE_ANON_KEY (your service anon key)');
}

export const supabase = createClient(
  config.url || 'https://placeholder-url.supabase.co', 
  config.key || 'placeholder-key'
);
