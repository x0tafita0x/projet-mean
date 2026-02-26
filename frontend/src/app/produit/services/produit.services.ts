import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../shared/service/api.service';
import { Observable } from 'rxjs';
import { Produit, TypeProduit, SousTypeProduit, ProduitDetail } from '../models/produit.models';
import { Boutique, TypeBoutique } from '../../boutique/models/boutique.models';
import { PaginatedResponse, FilterCriteria } from '../../shared/models/pagination.models';

@Injectable({
    providedIn: 'root'
})
export class ProduitService {
    private apiService = inject(ApiService);

    // Boutiques
    getBoutiques(): Observable<Boutique[]> {
        return this.apiService.getList<Boutique[]>('boutique');
    }

    getProduits(filters: FilterCriteria = {}): Observable<PaginatedResponse<Produit>> {
        const params: string[] = [];

        if (filters.page) params.push(`page=${filters.page}`);
        if (filters.limit) params.push(`limit=${filters.limit}`);
        if (filters.nom) params.push(`nom=${encodeURIComponent(filters.nom)}`);
        if (filters.boutique) params.push(`boutique=${encodeURIComponent(filters.boutique)}`);
        if (filters.typeProduit) params.push(`typeProduit=${encodeURIComponent(filters.typeProduit)}`);
        if (filters.sousTypeProduit) params.push(`sousTypeProduit=${encodeURIComponent(filters.sousTypeProduit)}`);
        if (filters.startDate) params.push(`startDate=${filters.startDate}`);
        if (filters.endDate) params.push(`endDate=${filters.endDate}`);
        if (filters.order) params.push(`order=${encodeURIComponent(filters.order)}`);

        // Coller tous les paramètres avec '&'
        const queryString = params.length ? '?' + params.join('&') : '';

        return this.apiService.getList<PaginatedResponse<Produit>>(`produits${queryString}`);
    }

    getProduitsByBoutiqueId(id: string | null): Observable<PaginatedResponse<Produit>> {
        return this.getProduits({ boutique: id || '', order: 'asc' });
    }

    getProduitById(id: string | null): Observable<ProduitDetail> {
        return this.apiService.getById<ProduitDetail>('produits', id || '');
    }

    createProduit(produit: Produit | FormData): Observable<Produit> {
        return this.apiService.create<Produit>('produits', produit as any);
    }

    updateProduit(id: string, produit: Produit | FormData): Observable<Produit> {
        return this.apiService.update<Produit>(`produits/${id}`, produit as any);
    }

    deleteProduit(id: string): Observable<void> {
        return this.apiService.delete('produits', id);
    }

    // TypeProduits
    getTypeProduits(filters: FilterCriteria = {}): Observable<PaginatedResponse<TypeProduit>> {
        const params: string[] = [];
        if (filters.page) params.push(`page=${filters.page}`);
        if (filters.limit) params.push(`limit=${filters.limit}`);
        const queryString = params.length ? '?' + params.join('&') : '';
        return this.apiService.getList<PaginatedResponse<TypeProduit>>(`type-sous-type/type-produit${queryString}`);
    }

    getTypeProduitById(id: string): Observable<TypeProduit> {
        return this.apiService.getById<TypeProduit>('type-sous-type/type-produit', id);
    }

    createTypeProduit(typeProduit: TypeProduit): Observable<TypeProduit> {
        return this.apiService.create<TypeProduit>('type-sous-type/type-produit', typeProduit);
    }

    updateTypeProduit(id: string, typeProduit: TypeProduit): Observable<TypeProduit> {
        return this.apiService.update<TypeProduit>(`type-sous-type/type-produit/${id}`, typeProduit);
    }

    deleteTypeProduit(id: string): Observable<void> {
        return this.apiService.delete('type-sous-type/type-produit', id);
    }

    // SousTypeProduits
    getSousTypeProduits(filters: FilterCriteria = {}): Observable<PaginatedResponse<SousTypeProduit>> {
        const params: string[] = [];
        if (filters.page) params.push(`page=${filters.page}`);
        if (filters.limit) params.push(`limit=${filters.limit}`);
        const queryString = params.length ? '?' + params.join('&') : '';
        return this.apiService.getList<PaginatedResponse<SousTypeProduit>>(`type-sous-type/sous-type-produit${queryString}`);
    }

    getSousTypeProduitById(id: string): Observable<SousTypeProduit> {
        return this.apiService.getById<SousTypeProduit>('type-sous-type/sous-type-produit', id);
    }

    createSousTypeProduit(sousTypeProduit: SousTypeProduit): Observable<SousTypeProduit> {
        return this.apiService.create<SousTypeProduit>('type-sous-type/sous-type-produit', sousTypeProduit);
    }

    updateSousTypeProduit(id: string, sousTypeProduit: SousTypeProduit): Observable<SousTypeProduit> {
        return this.apiService.update<SousTypeProduit>(`type-sous-type/sous-type-produit/${id}`, sousTypeProduit);
    }

    deleteSousTypeProduit(id: string): Observable<void> {
        return this.apiService.delete('type-sous-type/sous-type-produit', id);
    }
}
