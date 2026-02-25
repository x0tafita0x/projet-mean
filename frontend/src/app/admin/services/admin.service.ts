import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../auth/services/auth.service';
import { inject, Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AdminService {
    private http = inject(HttpClient);
    private authService = inject(AuthService);
    private readonly base = `${environment.apiUrl}/admin`;

    private getHeaders(): { headers: HttpHeaders } {
        const token = this.authService.getToken();
        return {
            headers: new HttpHeaders({
                'Authorization': `Bearer ${token}`
            })
        };
    }

    // ─── Stats & Dashboard ────────────────────────────────
    getDashboardStats(filters: any = {}): Observable<any> {
        let params = '';
        const keys = Object.keys(filters);
        if (keys.length > 0) {
            params = '?' + keys.map(k => `${k}=${filters[k]}`).join('&');
        }
        return this.http.get<any>(`${this.base}/stats${params}`, this.getHeaders());
    }

    // ─── Boutiques ─────────────────────────────────────
    getBoutiques(): Observable<any[]> {
        return this.http.get<any[]>(`${this.base}/boutiques`, this.getHeaders());
    }
    getBoutiqueById(id: string): Observable<any> {
        return this.http.get<any>(`${this.base}/boutiques/${id}`, this.getHeaders());
    }
    setBoutiqueStatus(id: string, status: string): Observable<any> {
        return this.http.patch(`${this.base}/boutiques/${id}/status`, { status }, this.getHeaders());
    }
    setBoutiqueCommission(id: string, tauxCommission: number): Observable<any> {
        return this.http.patch(`${this.base}/boutiques/${id}/commission`, { tauxCommission }, this.getHeaders());
    }
    deleteBoutique(id: string): Observable<any> {
        return this.http.delete(`${this.base}/boutiques/${id}`, this.getHeaders());
    }

    // ─── Utilisateurs ──────────────────────────────────
    getAcheteurs(): Observable<any[]> {
        return this.http.get<any[]>(`${this.base}/utilisateurs`, this.getHeaders());
    }
    toggleUserActive(id: string): Observable<any> {
        return this.http.patch(`${this.base}/utilisateurs/${id}/toggle-active`, {}, this.getHeaders());
    }
    deleteUser(id: string): Observable<any> {
        return this.http.delete(`${this.base}/utilisateurs/${id}`, this.getHeaders());
    }
    getUserOrderHistory(id: string): Observable<any> {
        return this.http.get<any>(`${this.base}/utilisateurs/${id}/historique`, this.getHeaders());
    }

    // ─── Commandes ─────────────────────────────────────
    getCommandes(): Observable<any[]> {
        return this.http.get<any[]>(`${this.base}/commandes`, this.getHeaders());
    }
    getCommandeDetails(id: string): Observable<any> {
        return this.http.get<any>(`${this.base}/commandes/${id}`, this.getHeaders());
    }

    // ─── Commissions ───────────────────────────────────
    getCommissionConfig(): Observable<any> {
        return this.http.get<any>(`${this.base}/commissions/config`, this.getHeaders());
    }
    setGlobalRate(tauxGlobal: number): Observable<any> {
        return this.http.put(`${this.base}/commissions/config`, { tauxGlobal }, this.getHeaders());
    }
    getCommissionsByBoutique(): Observable<any[]> {
        return this.http.get<any[]>(`${this.base}/commissions/boutiques`, this.getHeaders());
    }
    getMonthlyCommissions(): Observable<any[]> {
        return this.http.get<any[]>(`${this.base}/commissions/mensuel`, this.getHeaders());
    }
}
