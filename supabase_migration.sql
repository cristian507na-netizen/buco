-- 1. Add cash_balance to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cash_balance DECIMAL DEFAULT 0;

-- 2. Update user_settings table
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS include_credit_in_balance BOOLEAN DEFAULT false;

-- 3. Update expenses table
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS source_type TEXT CHECK (source_type IN ('cash', 'card', 'bank_account')) DEFAULT 'cash';
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS source_id UUID;

-- 4. Create incomes table
CREATE TABLE IF NOT EXISTS incomes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    monto DECIMAL NOT NULL,
    categoria TEXT,
    fecha TIMESTAMP WITH TIME ZONE DEFAULT now(),
    metodo_pago TEXT,
    descripcion TEXT,
    origen TEXT DEFAULT 'manual',
    source_type TEXT CHECK (source_type IN ('cash', 'card', 'bank_account')) DEFAULT 'cash',
    source_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE incomes ENABLE ROW LEVEL SECURITY;
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own incomes.' AND tablename = 'incomes') THEN
        CREATE POLICY "Users can view their own incomes." ON incomes FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their own incomes.' AND tablename = 'incomes') THEN
        CREATE POLICY "Users can insert their own incomes." ON incomes FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete their own incomes.' AND tablename = 'incomes') THEN
        CREATE POLICY "Users can delete their own incomes." ON incomes FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- 5. RPC functions for atomic updates
CREATE OR REPLACE FUNCTION register_expense_v1(
    p_user_id UUID,
    p_monto DECIMAL,
    p_categoria TEXT,
    p_comercio TEXT,
    p_fecha TIMESTAMP WITH TIME ZONE,
    p_metodo_pago TEXT,
    p_descripcion TEXT,
    p_origen TEXT,
    p_source_type TEXT,
    p_source_id UUID
) RETURNS VOID AS $$
BEGIN
    INSERT INTO expenses (user_id, monto, categoria, comercio, fecha, metodo_pago, descripcion, origen, source_type, source_id)
    VALUES (p_user_id, p_monto, p_categoria, p_comercio, p_fecha, p_metodo_pago, p_descripcion, p_origen, p_source_type, p_source_id);

    IF p_source_type = 'cash' THEN
        UPDATE profiles SET cash_balance = cash_balance - p_monto WHERE id = p_user_id;
    ELSIF p_source_type = 'bank_account' THEN
        UPDATE bank_accounts SET saldo_actual = saldo_actual - p_monto WHERE id = p_source_id AND user_id = p_user_id;
    ELSIF p_source_type = 'card' THEN
        UPDATE credit_cards SET saldo_actual = 
            CASE 
                WHEN tipo_tarjeta = 'credito' THEN saldo_actual + p_monto
                ELSE saldo_actual - p_monto
            END
        WHERE id = p_source_id AND user_id = p_user_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION register_income_v1(
    p_user_id UUID,
    p_monto DECIMAL,
    p_categoria TEXT,
    p_fecha TIMESTAMP WITH TIME ZONE,
    p_metodo_pago TEXT,
    p_descripcion TEXT,
    p_origen TEXT,
    p_source_type TEXT,
    p_source_id UUID
) RETURNS VOID AS $$
BEGIN
    INSERT INTO incomes (user_id, monto, categoria, fecha, metodo_pago, descripcion, origen, source_type, source_id)
    VALUES (p_user_id, p_monto, p_categoria, p_fecha, p_metodo_pago, p_descripcion, p_origen, p_source_type, p_source_id);

    IF p_source_type = 'cash' THEN
        UPDATE profiles SET cash_balance = cash_balance + p_monto WHERE id = p_user_id;
    ELSIF p_source_type = 'bank_account' THEN
        UPDATE bank_accounts SET saldo_actual = saldo_actual + p_monto WHERE id = p_source_id AND user_id = p_user_id;
    ELSIF p_source_type = 'card' THEN
        UPDATE credit_cards SET saldo_actual = 
            CASE 
                WHEN tipo_tarjeta = 'credito' THEN saldo_actual - p_monto
                ELSE saldo_actual + p_monto
            END
        WHERE id = p_source_id AND user_id = p_user_id;
    END IF;
END;
$$ LANGUAGE plpgsql;
