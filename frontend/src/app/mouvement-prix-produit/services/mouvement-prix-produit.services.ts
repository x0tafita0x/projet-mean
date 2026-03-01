import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../shared/service/api.service';
import { Observable } from 'rxjs';
import { MouvementPrixProduit, MouvementPrixProduitByProduit, MouvementPrixProduitInsert } from '../models/mouvement-prix-produit.models';
import { PaginatedResponse, FilterCriteria } from '../../shared/models/pagination.models';

@Injectable({
    providedIn: 'root'
})

export class MouvementPrixProduitService {
    private apiService = inject(ApiService);

    createMouvementPrixProduit(mouvementPrixProduit: MouvementPrixProduitInsert): Observable<MouvementPrixProduitInsert> {
        return this.apiService.create<MouvementPrixProduitInsert>('mouvements-prix-produit', mouvementPrixProduit);
    }

    getMouvementsPrixByProduit(boutique: string, filters: FilterCriteria = {}): Observable<PaginatedResponse<MouvementPrixProduit>> {
        const params: string[] = [`boutique=${encodeURIComponent(boutique)}`];
        if (filters.page) params.push(`page=${filters.page}`);
        if (filters.limit) params.push(`limit=${filters.limit}`);
        if (filters.startDate) params.push(`startDate=${filters.startDate}`);
        if (filters.endDate) params.push(`endDate=${filters.endDate}`);
        if (filters.search) params.push(`search=${encodeURIComponent(filters.search)}`);

        const queryString = params.length ? '?' + params.join('&') : '';
        return this.apiService.getList<PaginatedResponse<MouvementPrixProduit>>(`mouvements-prix-produit${queryString}`);
    }
    getLastMouvementPrixByProduit(produitId: string): Observable<MouvementPrixProduit> {
        return this.apiService.getList<MouvementPrixProduit>('mouvements-prix-produit/last/' + produitId);
    }

    getPrixActuelByProduit(boutique: string): Observable<MouvementPrixProduitByProduit[]> {
        return this.apiService.getList<MouvementPrixProduitByProduit[]>('mouvements-prix-produit/prix-actuel?boutique=' + encodeURIComponent(boutique));
    }

}