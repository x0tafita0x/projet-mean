import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../shared/service/api.service';
import { Observable } from 'rxjs';
import { Boutique, TypeBoutique, BoutiqueDashboardStats } from '../models/boutique.models';
import { PaginatedResponse, FilterCriteria } from '../../shared/models/pagination.models';

@Injectable({
    providedIn: 'root'
})
export class BoutiqueService {
    private apiService = inject(ApiService);

    // TypeBoutiques
    getTypeBoutiques(filters: FilterCriteria = {}): Observable<PaginatedResponse<TypeBoutique>> {
        const params: string[] = [];
        if (filters.page) params.push(`page=${filters.page}`);
        if (filters.limit) params.push(`limit=${filters.limit}`);
        const queryString = params.length ? '?' + params.join('&') : '';
        return this.apiService.getList<PaginatedResponse<TypeBoutique>>(`type-sous-type/type-boutique${queryString}`);
    }

    getTypeBoutiqueById(id: string): Observable<TypeBoutique> {
        return this.apiService.getById<TypeBoutique>('type-sous-type/type-boutique', id);
    }

    createTypeBoutique(typeBoutique: TypeBoutique): Observable<TypeBoutique> {
        return this.apiService.create<TypeBoutique>('type-sous-type/type-boutique', typeBoutique);
    }

    updateTypeBoutique(id: string, typeBoutique: TypeBoutique): Observable<TypeBoutique> {
        return this.apiService.update<TypeBoutique>(`type-sous-type/type-boutique/${id}`, typeBoutique);
    }

    deleteTypeBoutique(id: string): Observable<void> {
        return this.apiService.delete('type-sous-type/type-boutique', id);
    }

    // Boutiques
    getBoutiques(filters: FilterCriteria = {}): Observable<PaginatedResponse<Boutique>> {
        const params: string[] = [];

        if (filters.page) params.push(`page=${filters.page}`);
        if (filters.limit) params.push(`limit=${filters.limit}`);
        if (filters.nom) params.push(`nom=${encodeURIComponent(filters.nom)}`);
        if (filters.typeBoutique) params.push(`typeBoutique=${encodeURIComponent(filters.typeBoutique)}`);
        if (filters.nbJoursOuverture) params.push(`nbJoursOuverture=${encodeURIComponent(filters.nbJoursOuverture)}`);
        if (filters.startDate) params.push(`startDate=${filters.startDate}`);
        if (filters.endDate) params.push(`endDate=${filters.endDate}`);
        if (filters.order) params.push(`order=${encodeURIComponent(filters.order)}`);

        // Coller tous les paramètres avec '&'
        const queryString = params.length ? '?' + params.join('&') : '';

        return this.apiService.getList<PaginatedResponse<Boutique>>(`boutique${queryString}`);
    }

    getBoutiqueById(id: string): Observable<Boutique> {
        return this.apiService.getById<Boutique>('boutique', id);
    }

    createBoutique(boutique: Boutique | FormData): Observable<Boutique> {
        return this.apiService.create<Boutique>('boutique', boutique as any);
    }

    updateBoutique(id: string, boutique: Boutique | FormData): Observable<Boutique> {
        return this.apiService.update<Boutique>(`boutique/${id}`, boutique as any);
    }

    deleteBoutique(id: string): Observable<void> {
        return this.apiService.delete('boutique', id);
    }

    getDashboardStats(id: string, filters: { startDate?: string, endDate?: string } = {}): Observable<BoutiqueDashboardStats> {
        const params: string[] = [];
        if (filters.startDate) params.push(`startDate=${filters.startDate}`);
        if (filters.endDate) params.push(`endDate=${filters.endDate}`);
        const queryString = params.length ? '?' + params.join('&') : '';
        return this.apiService.getList<BoutiqueDashboardStats>(`boutique/${id}/dashboard${queryString}`);
    }
}
