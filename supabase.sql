-- SQL to initialize your Supabase database

-- Create Events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  event_date DATE,
  event_time TIME,
  revenue DECIMAL(12, 2) DEFAULT 0,
  divider DECIMAL(12, 2) DEFAULT 2,
  invoice_tax_percentage DECIMAL(5, 2) DEFAULT 6,
  observations TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  value DECIMAL(12, 2) DEFAULT 0,
  paid_km BOOLEAN DEFAULT FALSE,
  paid_ms BOOLEAN DEFAULT FALSE
);

-- Create Settings table
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  default_tax_percentage DECIMAL(5, 2) DEFAULT 6,
  default_divider DECIMAL(12, 2) DEFAULT 2,
  business_name TEXT DEFAULT 'SOM GESTOR EPP',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

-- ATIVAR SEGURANÇA (RLS)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- LIMPAR POLÍTICAS EXISTENTES
DROP POLICY IF EXISTS "Public Access Events" ON events;
DROP POLICY IF EXISTS "Public Access Expenses" ON expenses;
DROP POLICY IF EXISTS "Public Access Settings" ON settings;

-- CRIAR POLÍTICAS DE ACESSO (Permitir tudo para quem tem a chave anon)
CREATE POLICY "Public Access Events" ON events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access Expenses" ON expenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access Settings" ON settings FOR ALL USING (true) WITH CHECK (true);

-- Inserir linha inicial de configurações
INSERT INTO settings (id, business_name) VALUES (1, 'SOM GESTOR EPP') ON CONFLICT (id) DO NOTHING;
