export interface User {
    id: number;
    email: string;
    name: string;
    full_name?: string;
    role?: string;
    team_id?: number;
}

export interface AuthResponse {
    access_token: string;
    token_type: string;
}

export interface Track {
    id: number;
    name: string;
    location?: string;
    country?: string;
    length_meters?: number;
    layout_image_url?: string;
    notes?: string;
}

export interface Session {
    id: number;
    team_id: number;
    driver_id: number;
    track_id: number;
    kart_id?: number;
    engine_id?: number;
    session_date: string;
    session_type?: string;
    data_source?: string;
    air_temp_celsius?: number;
    track_temp_celsius?: number;
    humidity_percent?: number;
    weather_condition?: string;
    track_condition?: string;
    track_grip_level?: number;
    setup_data?: Record<string, any>;
    best_lap_time_ms?: number;
    average_lap_time_ms?: number;
    total_laps?: number;
    position?: number;
    driver_feedback?: string;
    engineer_notes?: string;
    telemetry_file_path?: string;
    created_at: string;
    updated_at?: string;
    track?: Track;
}

export interface TelemetryAnalysis {
    session_id: number;
    best_lap_time_ms: number;
    average_lap_time_ms: number;
    total_laps: number;
    lap_times: number[];
    consistency_score: number;
    improvement_trend: string;
}

export interface Driver {
    id: number;
    team_id: number;
    name: string;
    date_of_birth?: string;
    weight_kg?: number;
    height_cm?: number;
    gender?: string;
    experience_level?: string;
    physical_strength?: number;
    bio_metrics?: Record<string, any>;
    notes?: string;
}

export interface Kart {
    id: number;
    name: string;
    number?: string;
    chassis_make?: string;
    chassis_model?: string;
    year?: number;
    team_id: number;
}

export interface Engine {
    id: number;
    brand: string;
    model: string;
    serial_number?: string;
    hours_since_rebuild: number;
}

export interface TelemetryDataPoint {
    distance_m: number;
    time_s: number;
    speed_kmh: number;
    throttle_pct: number;
    brake_pct: number;
    steering_pct: number;
    gear: number;
    rpm: number;
    g_lat?: number;
    g_long?: number;
}

export interface Lap {
    id: number;
    team_id: number;
    driver_id: number;
    track_id: number;
    kart_id?: number;
    session_id?: number;
    lap_number: number;
    lap_time_ms: number;
    sector1_ms?: number;
    sector2_ms?: number;
    sector3_ms?: number;
    sector4_ms?: number;
    valid: boolean;
    weather?: string;
    driver_name?: string;
    track_name?: string;
    car_name?: string;
    recorded_at?: string;
    has_detailed_telemetry?: boolean;
}
