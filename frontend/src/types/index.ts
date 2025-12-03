export interface User {
    id: number;
    email: string;
    full_name: string | null;
    role: string;
    team_id: number;
}

export interface AuthResponse {
    access_token: string;
    refresh_token: string;
    token_type: string;
}

export interface Team {
    id: number;
    name: string;
    country: string | null;
}
