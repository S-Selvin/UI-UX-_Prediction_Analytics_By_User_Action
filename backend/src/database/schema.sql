-- ShopSense PostgreSQL Schema

-- 1. Websites Table
CREATE TABLE IF NOT EXISTS websites (
    website_id VARCHAR(50) PRIMARY KEY,
    website_name VARCHAR(255) NOT NULL,
    website_type VARCHAR(50) NOT NULL, -- E-commerce, Education, etc.
    primary_goal VARCHAR(50) NOT NULL, -- Purchase, Registration, etc.
    tracking_status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users Table
CREATE TABLE IF NOT EXISTS users (
    user_id VARCHAR(50) PRIMARY KEY,
    website_id VARCHAR(50) REFERENCES websites(website_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Sessions Table
CREATE TABLE IF NOT EXISTS sessions (
    session_id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(user_id),
    website_id VARCHAR(50) REFERENCES websites(website_id),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    last_activity TIMESTAMP WITH TIME ZONE,
    current_page VARCHAR(255),
    behavior_status VARCHAR(50), -- ACTIVE, ENGAGED, HESITATING, INACTIVE, CONFUSED
    goal_status VARCHAR(50),
    session_status VARCHAR(20) DEFAULT 'ACTIVE', -- ACTIVE, ENDED, ABANDONED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Events Table
CREATE TABLE IF NOT EXISTS events (
    event_id VARCHAR(50) PRIMARY KEY,
    session_id VARCHAR(50) REFERENCES sessions(session_id),
    user_id VARCHAR(50) REFERENCES users(user_id),
    website_id VARCHAR(50) REFERENCES websites(website_id),
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    event_type VARCHAR(50) NOT NULL, -- page_view, click, add_to_cart, etc.
    page VARCHAR(255) NOT NULL,
    element VARCHAR(255),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Behavior Features Table
CREATE TABLE IF NOT EXISTS behavior_features (
    session_id VARCHAR(50) PRIMARY KEY REFERENCES sessions(session_id),
    session_duration INTEGER NOT NULL,
    pages_viewed INTEGER NOT NULL,
    total_clicks INTEGER NOT NULL,
    total_scrolls INTEGER NOT NULL,
    total_idle_time INTEGER NOT NULL,
    back_navigation_count INTEGER NOT NULL,
    products_viewed INTEGER NOT NULL,
    cart_actions INTEGER NOT NULL,
    click_frequency NUMERIC,
    scroll_depth NUMERIC,
    average_time_per_page NUMERIC,
    engagement_score INTEGER NOT NULL,
    activity_score INTEGER NOT NULL,
    hesitation_score INTEGER NOT NULL,
    navigation_confusion_score INTEGER NOT NULL,
    behavior_status VARCHAR(50) NOT NULL,
    reasons JSONB
);

-- 6. Predictions Table
CREATE TABLE IF NOT EXISTS predictions (
    prediction_id SERIAL PRIMARY KEY,
    session_id VARCHAR(50) REFERENCES sessions(session_id),
    risk_score NUMERIC NOT NULL,
    risk_level VARCHAR(20) NOT NULL, -- LOW, MEDIUM, HIGH
    confidence NUMERIC NOT NULL,
    reasons JSONB,
    hesitation_signal INTEGER,
    inactivity_signal INTEGER,
    navigation_confusion_signal INTEGER,
    engagement_signal INTEGER,
    activity_signal INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Recommendations Table
CREATE TABLE IF NOT EXISTS recommendations (
    recommendation_id VARCHAR(50) PRIMARY KEY,
    session_id VARCHAR(50) REFERENCES sessions(session_id),
    category VARCHAR(50) NOT NULL, -- NAVIGATION, ENGAGEMENT, etc.
    priority VARCHAR(20) NOT NULL, -- LOW, MEDIUM, HIGH
    title VARCHAR(255) NOT NULL,
    description TEXT,
    reason TEXT,
    evidence JSONB,
    suggested_action TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for frequent queries
CREATE INDEX IF NOT EXISTS idx_events_session_id ON events(session_id);
CREATE INDEX IF NOT EXISTS idx_events_website_id ON events(website_id);
CREATE INDEX IF NOT EXISTS idx_sessions_website_id ON sessions(website_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_session_id ON predictions(session_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_session_id ON recommendations(session_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(session_status);
CREATE INDEX IF NOT EXISTS idx_sessions_goal ON sessions(goal_status);
CREATE INDEX IF NOT EXISTS idx_sessions_start_time ON sessions(start_time);
