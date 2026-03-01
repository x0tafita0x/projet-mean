import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, AuthResponse, User } from '../models/auth.models';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private http = inject(HttpClient);
    private readonly apiUrl = `${environment.apiUrl}/auth`;
    private readonly TOKEN_KEY = 'auth_token';
    private readonly USER_KEY = 'auth_user';

    private userSignal = signal<User | null>(this.getUserFromStorage());

    currentUser = computed(() => this.userSignal());
    isAuthenticated = computed(() => !!this.userSignal());

    private getUserFromStorage(): User | null {
        const user = sessionStorage.getItem(this.USER_KEY);
        return user ? JSON.parse(user) : null;
    }

    private setSession(authResponse: AuthResponse): void {
        sessionStorage.setItem(this.TOKEN_KEY, authResponse.token);
        sessionStorage.setItem(this.USER_KEY, JSON.stringify(authResponse.user));
        this.userSignal.set(authResponse.user);
    }

    loginAdmin(credentials: LoginRequest): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/login/admin`, credentials)
            .pipe(tap(response => this.setSession(response)));
    }

    loginBoutique(credentials: LoginRequest): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/login/boutique`, credentials)
            .pipe(tap(response => this.setSession(response)));
    }

    loginAcheteur(credentials: LoginRequest): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/login/acheteur`, credentials)
            .pipe(tap(response => this.setSession(response)));
    }

    register(user: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/register`, user);
    }

    logout(): void {
        sessionStorage.removeItem(this.TOKEN_KEY);
        sessionStorage.removeItem(this.USER_KEY);
        this.userSignal.set(null);
    }

    getToken(): string | null {
        return sessionStorage.getItem(this.TOKEN_KEY);
    }

}
