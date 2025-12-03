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
    notes?: string;
}
