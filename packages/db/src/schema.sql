-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. IDENTITY DOMAIN
-- ==========================================

-- Table: users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    preferred_language VARCHAR(10) DEFAULT 'en' NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Table: sessions
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token VARCHAR(500) UNIQUE NOT NULL,
    ip VARCHAR(100),
    device VARCHAR(255),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Table: user_preferences
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    language VARCHAR(10) DEFAULT 'en' NOT NULL,
    theme VARCHAR(50) DEFAULT 'light' NOT NULL,
    notification_enabled BOOLEAN DEFAULT TRUE NOT NULL,
    farmer_mode BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ==========================================
-- 2. FARM DOMAIN
-- ==========================================

-- Table: farms
CREATE TABLE IF NOT EXISTS farms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    farm_name VARCHAR(255) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    area_acres DOUBLE PRECISION NOT NULL,
    soil_type VARCHAR(100),
    village VARCHAR(100),
    district VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Table: crop_cycles
CREATE TABLE IF NOT EXISTS crop_cycles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    crop_name VARCHAR(100) NOT NULL,
    season VARCHAR(100) NOT NULL,
    planting_date TIMESTAMP WITH TIME ZONE NOT NULL,
    expected_harvest TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) NOT NULL, -- e.g., ACTIVE, HARVESTED, FAILED
    yield_prediction DOUBLE PRECISION,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Table: farm_images
CREATE TABLE IF NOT EXISTS farm_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    taken_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- ==========================================
-- 3. WEATHER DOMAIN
-- ==========================================

-- Table: weather_cache
CREATE TABLE IF NOT EXISTS weather_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    forecast_date TIMESTAMP WITH TIME ZONE NOT NULL,
    temperature DOUBLE PRECISION,
    humidity DOUBLE PRECISION,
    rainfall DOUBLE PRECISION,
    wind_speed DOUBLE PRECISION,
    pressure DOUBLE PRECISION,
    weather_json JSONB,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_weather_cache_farm_date ON weather_cache(farm_id, forecast_date);

-- Table: weather_history
CREATE TABLE IF NOT EXISTS weather_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    temperature_min DOUBLE PRECISION,
    temperature_max DOUBLE PRECISION,
    humidity DOUBLE PRECISION,
    rainfall DOUBLE PRECISION,
    wind_speed DOUBLE PRECISION,
    pressure DOUBLE PRECISION,
    weather_json JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_weather_history_farm_date ON weather_history(farm_id, date);

-- ==========================================
-- 4. SATELLITE DOMAIN
-- ==========================================

-- Table: satellite_analysis
CREATE TABLE IF NOT EXISTS satellite_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    analysis_date TIMESTAMP WITH TIME ZONE NOT NULL,
    ndvi DOUBLE PRECISION,
    ndwi DOUBLE PRECISION,
    ndbi DOUBLE PRECISION,
    nbr DOUBLE PRECISION,
    vegetation_score DOUBLE PRECISION,
    soil_moisture DOUBLE PRECISION,
    land_cover VARCHAR(100),
    satellite VARCHAR(100),
    raw_json JSONB,
    metadata JSONB DEFAULT '{}'::jsonb NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_satellite_analysis_farm_date ON satellite_analysis(farm_id, analysis_date);

-- Table: satellite_jobs
CREATE TABLE IF NOT EXISTS satellite_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    job_status VARCHAR(50) NOT NULL, -- e.g., PENDING, RUNNING, COMPLETED, FAILED
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    request_hash VARCHAR(255),
    cost DOUBLE PRECISION
);

-- ==========================================
-- 5. PREDICTION DOMAIN
-- ==========================================

-- Table: predictions
CREATE TABLE IF NOT EXISTS predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    prediction_type VARCHAR(100) NOT NULL, -- e.g., weather, yield, soil, crop, risk, irrigation
    result_json JSONB NOT NULL,
    confidence DOUBLE PRECISION,
    provider VARCHAR(100) NOT NULL,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_predictions_farm_type ON predictions(farm_id, prediction_type);

-- ==========================================
-- 6. AI DOMAIN
-- ==========================================

-- Table: conversations
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Table: messages
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL, -- e.g., user, assistant, system
    message TEXT NOT NULL,
    model VARCHAR(100),
    tokens INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Table: ai_reports
CREATE TABLE IF NOT EXISTS ai_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    report_type VARCHAR(100) NOT NULL, -- e.g., monthly, diagnostic, seasonal
    summary TEXT NOT NULL,
    generated_by VARCHAR(100) NOT NULL, -- e.g., Gemini-1.5-Pro
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ==========================================
-- 7. ALERT ENGINE DOMAIN
-- ==========================================

-- Table: alerts
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    severity VARCHAR(50) NOT NULL, -- e.g., INFO, WARNING, CRITICAL
    category VARCHAR(50) NOT NULL, -- e.g., WEATHER, CROP, SATELLITE, SOIL
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    recommendation TEXT,
    source VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL, -- e.g., ACTIVE, RESOLVED, DISMISSED
    metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Table: alert_events
CREATE TABLE IF NOT EXISTS alert_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_id UUID NOT NULL REFERENCES alerts(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL, -- e.g., Created, Read, Dismissed, Expired, Resolved
    changed_by VARCHAR(100), -- e.g., user_id or system
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Table: alert_rules
CREATE TABLE IF NOT EXISTS alert_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    operator VARCHAR(20) NOT NULL, -- e.g., >, <, ==
    threshold VARCHAR(50) NOT NULL, -- e.g., 20%, 60%, 10mm
    severity VARCHAR(50) NOT NULL,
    enabled BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ==========================================
-- 8. NOTIFICATION DOMAIN
-- ==========================================

-- Table: notification_queue
CREATE TABLE IF NOT EXISTS notification_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_id UUID NOT NULL REFERENCES alerts(id) ON DELETE CASCADE,
    channel VARCHAR(50) NOT NULL, -- e.g., SMS, EMAIL, PUSH
    status VARCHAR(50) NOT NULL, -- e.g., PENDING, SENT, FAILED
    retry_count INTEGER DEFAULT 0 NOT NULL,
    scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Table: notification_logs
CREATE TABLE IF NOT EXISTS notification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    queue_id UUID NOT NULL REFERENCES notification_queue(id) ON DELETE CASCADE,
    success BOOLEAN NOT NULL,
    provider VARCHAR(100) NOT NULL, -- e.g., Twilio, SendGrid
    response JSONB,
    metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ==========================================
-- 9. SYSTEM DOMAIN
-- ==========================================

-- Table: audit_logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_name VARCHAR(100),
    entity_id VARCHAR(100),
    changes JSONB,
    ip_address VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Table: api_usage
CREATE TABLE IF NOT EXISTS api_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    provider VARCHAR(100) NOT NULL, -- e.g., GEMINI, GEE, OPENWEATHER
    tokens INTEGER,
    latency INTEGER, -- milliseconds
    cost DOUBLE PRECISION,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Table: feature_flags
CREATE TABLE IF NOT EXISTS feature_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flag_key VARCHAR(100) UNIQUE NOT NULL,
    description VARCHAR(255),
    enabled BOOLEAN DEFAULT FALSE NOT NULL,
    rules JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ==========================================
-- 10. ASYNC JOBS DOMAIN
-- ==========================================

-- Table: analysis_jobs
-- Stores async Earth Engine computation job status and results.
CREATE TABLE IF NOT EXISTS analysis_jobs (
    id VARCHAR(100) PRIMARY KEY,
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending | completed | error
    input JSONB NOT NULL,
    data JSONB,
    error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    failed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_analysis_jobs_status ON analysis_jobs(status);
CREATE INDEX IF NOT EXISTS idx_analysis_jobs_created ON analysis_jobs(created_at DESC);
