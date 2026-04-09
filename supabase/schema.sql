-- ПРОФИЛИ
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'secretary')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- СТАЦИОНАРНИ РАЗХОДИ
CREATE TABLE fixed_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('rent', 'salaries', 'utilities', 'other')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ФАКТУРИ
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  client_name TEXT NOT NULL,
  description TEXT,
  amount_no_vat DECIMAL(10,2) NOT NULL,
  vat_amount DECIMAL(10,2) DEFAULT 0,
  amount_with_vat DECIMAL(10,2) NOT NULL,
  has_vat BOOLEAN DEFAULT TRUE,
  invoice_date DATE NOT NULL,
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'unpaid' CHECK (status IN ('paid_cash', 'paid_bank', 'unpaid', 'overdue', 'no_invoice')),
  payment_date DATE,
  payment_method TEXT CHECK (payment_method IN ('cash', 'bank', NULL)),
  notes TEXT,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- КАСОВИ ДВИЖЕНИЯ
CREATE TABLE cash_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'bank')),
  description TEXT NOT NULL,
  client_or_supplier TEXT,
  invoice_id UUID REFERENCES invoices(id),
  movement_date DATE NOT NULL DEFAULT CURRENT_DATE,
  category TEXT CHECK (category IN ('invoice_payment', 'advance', 'expense_material', 'expense_travel', 'expense_salary', 'expense_other', 'income_no_invoice', 'other')),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- КОМАНДИРОВКИ
CREATE TABLE business_trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  destination TEXT NOT NULL,
  trip_date DATE NOT NULL,
  days INTEGER NOT NULL DEFAULT 1,
  people INTEGER NOT NULL DEFAULT 1,
  fuel_cost DECIMAL(10,2) DEFAULT 0,
  accommodation_cost DECIMAL(10,2) DEFAULT 0,
  other_cost DECIMAL(10,2) DEFAULT 0,
  total_cost DECIMAL(10,2) GENERATED ALWAYS AS (fuel_cost + accommodation_cost + other_cost) STORED,
  notes TEXT,
  order_reference TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- МЕСЕЧНИ SNAPSHOT
CREATE TABLE monthly_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  total_income DECIMAL(10,2),
  total_expenses DECIMAL(10,2),
  fixed_costs_total DECIMAL(10,2),
  profit DECIMAL(10,2),
  vat_collected DECIMAL(10,2),
  vat_paid DECIMAL(10,2),
  vat_due DECIMAL(10,2),
  cash_balance DECIMAL(10,2),
  bank_balance DECIMAL(10,2),
  UNIQUE(month, year)
);

-- ROW LEVEL SECURITY
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE fixed_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_trips ENABLE ROW LEVEL SECURITY;

-- Profiles: всеки вижда своя профил, owner вижда всички
CREATE POLICY "Users see own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Owner sees all profiles" ON profiles FOR SELECT USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'owner'
);

-- Invoices
CREATE POLICY "Owner sees all invoices" ON invoices FOR ALL USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'owner'
);
CREATE POLICY "Secretary manages own invoices" ON invoices FOR ALL USING (
  created_by = auth.uid()
);

-- Cash movements
CREATE POLICY "Owner sees all movements" ON cash_movements FOR ALL USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'owner'
);
CREATE POLICY "Secretary manages own movements" ON cash_movements FOR ALL USING (
  created_by = auth.uid()
);

-- Fixed costs (owner only)
CREATE POLICY "Owner manages fixed costs" ON fixed_costs FOR ALL USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'owner'
);

-- Business trips
CREATE POLICY "Owner sees all trips" ON business_trips FOR ALL USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'owner'
);
CREATE POLICY "Secretary manages own trips" ON business_trips FOR ALL USING (
  created_by = auth.uid()
);
