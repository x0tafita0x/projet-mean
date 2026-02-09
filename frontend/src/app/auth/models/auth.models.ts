export interface LoginRequest {
    email: string;
    motDePasse: string;
}

export interface User {
    id: string;
    nom: string;
    email: string;
    role: 'admin' | 'boutique' | 'acheteur';
}

export interface AuthResponse {
    token: string;
    user: User;
}
