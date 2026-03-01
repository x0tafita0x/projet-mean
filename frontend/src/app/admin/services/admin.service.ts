import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../auth/services/auth.service';
import { inject, Injectable } from '@angular/core';
import { PaginatedResponse, FilterCriteria } from '../../shared/models/pagination.models';

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
    getBoutiques(filters: FilterCriteria = {}): Observable<PaginatedResponse<any>> {
        let params = new HttpParams();
        if (filters.page) params = params.set('page', filters.page.toString());
        if (filters.limit) params = params.set('limit', filters.limit.toString());
        if (filters.search) params = params.set('search', filters.search);
        if (filters.status) params = params.set('status', filters.status);

        return this.http.get<PaginatedResponse<any>>(`${this.base}/boutiques`, {
            ...this.getHeaders(),
            params: params
        });
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
    getAcheteurs(filters: FilterCriteria = {}): Observable<PaginatedResponse<any>> {
        let params = new HttpParams();
        if (filters.page) params = params.set('page', filters.page.toString());
        if (filters.limit) params = params.set('limit', filters.limit.toString());
        if (filters.search) params = params.set('search', filters.search);

        return this.http.get<PaginatedResponse<any>>(`${this.base}/utilisateurs`, {
            ...this.getHeaders(),
            params: params
        });
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
    getCommandes(filters: FilterCriteria = {}): Observable<PaginatedResponse<any>> {
        let params = new HttpParams();
        if (filters.page) params = params.set('page', filters.page.toString());
        if (filters.limit) params = params.set('limit', filters.limit.toString());
        if (filters.clientId) params = params.set('clientId', filters.clientId);
        if (filters.boutiqueId) params = params.set('boutiqueId', filters.boutiqueId);
        if (filters.startDate) params = params.set('startDate', filters.startDate);
        if (filters.endDate) params = params.set('endDate', filters.endDate);

        return this.http.get<PaginatedResponse<any>>(`${this.base}/commandes`, {
            ...this.getHeaders(),
            params: params
        });
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
    getMonthlyCommissions(filters: FilterCriteria = {}): Observable<PaginatedResponse<any>> {
        let params = new HttpParams();
        if (filters.page) params = params.set('page', filters.page.toString());
        if (filters.limit) params = params.set('limit', filters.limit.toString());
        return this.http.get<PaginatedResponse<any>>(`${this.base}/commissions/mensuel`, {
            ...this.getHeaders(),
            params: params
        });
    }
    getCommissionsByBoutique(filters: FilterCriteria = {}): Observable<PaginatedResponse<any>> {
        let params = new HttpParams();
        if (filters.page) params = params.set('page', filters.page.toString());
        if (filters.limit) params = params.set('limit', filters.limit.toString());
        return this.http.get<PaginatedResponse<any>>(`${this.base}/commissions/boutiques`, {
            ...this.getHeaders(),
            params: params
        });
    }
    getCommissionStats(): Observable<any> {
        return this.http.get<any>(`${this.base}/commissions/stats`, this.getHeaders());
    }
}
