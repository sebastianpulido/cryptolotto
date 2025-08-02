-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de usuarios
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    wallet_address VARCHAR(255),
    custodial_wallet VARCHAR(255),
    total_spent DECIMAL(10,2) DEFAULT 0,
    total_won DECIMAL(10,2) DEFAULT 0,
    tickets_purchased INTEGER DEFAULT 0,
    referral_code VARCHAR(50) UNIQUE,
    referred_by UUID REFERENCES users(id),
    vip_level VARCHAR(20) DEFAULT 'basic',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de loterías
CREATE TABLE lotteries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    round INTEGER UNIQUE NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    ticket_price DECIMAL(10,2) NOT NULL DEFAULT 1.00,
    total_pool DECIMAL(10,2) DEFAULT 0,
    tickets_sold INTEGER DEFAULT 0,
    max_tickets INTEGER DEFAULT 10000,
    status VARCHAR(20) DEFAULT 'active',
    winner_id UUID REFERENCES users(id),
    winner_ticket INTEGER,
    contract_address VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de tickets
CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lottery_id UUID NOT NULL REFERENCES lotteries(id),
    user_id UUID NOT NULL REFERENCES users(id),
    ticket_number INTEGER NOT NULL,
    purchase_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    transaction_hash VARCHAR(255),
    price DECIMAL(10,2) NOT NULL,
    is_winner BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de pagos
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    lottery_id UUID NOT NULL REFERENCES lotteries(id),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    method VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    stripe_payment_id VARCHAR(255),
    transaction_hash VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimización
CREATE INDEX idx_lotteries_status ON lotteries(status);
CREATE INDEX idx_lotteries_round ON lotteries(round);
CREATE INDEX idx_tickets_lottery_user ON tickets(lottery_id, user_id);
CREATE INDEX idx_tickets_number ON tickets(lottery_id, ticket_number);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_users_referral ON users(referral_code);

-- Función para generar código de referido
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TRIGGER AS $$
BEGIN
    NEW.referral_code = UPPER(SUBSTRING(MD5(NEW.id::text) FROM 1 FOR 8));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para generar código de referido automáticamente
CREATE TRIGGER trigger_generate_referral_code
    BEFORE INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION generate_referral_code();

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER trigger_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_lotteries_updated_at
    BEFORE UPDATE ON lotteries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Función para obtener estadísticas
CREATE OR REPLACE FUNCTION get_lottery_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_lotteries', (SELECT COUNT(*) FROM lotteries),
        'total_tickets_sold', (SELECT COALESCE(SUM(tickets_sold), 0) FROM lotteries),
        'total_prizes_paid', (SELECT COALESCE(SUM(total_won), 0) FROM users),
        'active_users', (SELECT COUNT(DISTINCT user_id) FROM tickets WHERE created_at > NOW() - INTERVAL '30 days'),
        'average_tickets_per_lottery', (SELECT COALESCE(AVG(tickets_sold), 0) FROM lotteries WHERE status = 'completed')
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Políticas de seguridad (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE lotteries ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Política para usuarios (solo pueden ver sus propios datos)
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Política para loterías (todos pueden ver)
CREATE POLICY "Anyone can view lotteries" ON lotteries
    FOR SELECT USING (true);

-- Política para tickets (usuarios solo ven sus tickets)
CREATE POLICY "Users can view own tickets" ON tickets
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own tickets" ON tickets
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Política para pagos (usuarios solo ven sus pagos)
CREATE POLICY "Users can view own payments" ON payments
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own payments" ON payments
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);