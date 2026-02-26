import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../shared/service/api.service';
import { Observable } from 'rxjs';
import { Favori, FavoriList } from '../models/favori.models';
import { PaginatedResponse, FilterCriteria } from '../../shared/models/pagination.models';

@Injectable({
    providedIn: 'root'
})
export class FavoriService {
    private apiService = inject(ApiService);

    // Boutiques
    getListeFavoris(filters: FilterCriteria = {}): Observable<PaginatedResponse<FavoriList>> {
        const params: string[] = [];
        if (filters.clientId) params.push(`utilisateur=${filters.clientId}`);
        if (filters.page) params.push(`page=${filters.page}`);
        if (filters.limit) params.push(`limit=${filters.limit}`);

        const queryString = params.length ? '?' + params.join('&') : '';
        return this.apiService.getList<PaginatedResponse<FavoriList>>(`favori${queryString}`);
    }

    createFavori(favori: Favori): Observable<Favori> {
        return this.apiService.create<Favori>('favori', favori);
    }

    deleteFavori(id: string): Observable<void> {
        return this.apiService.delete('favori', id);
    }
    isFavoriExist(boutique: string | '', utilisateur: string | ''): Observable<boolean> {
        return this.apiService.getList<boolean>(`favori/isFavoriExist?utilisateur=${utilisateur}&boutique=${boutique}`);
    }



}
