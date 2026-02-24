export interface LoginRequest {
    email: string;
    motDePasse: string;
}

export interface User {
    id: string;
    nom: string;
    email: string;
    role: 'admin' | 'boutique' | 'acheteur';
    boutique?: string; // ID de la boutique associée (si applicable)
}

export interface AuthResponse {
    token: string;
    user: User;
}
