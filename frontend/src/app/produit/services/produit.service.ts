import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../shared/service/api.service';
import { Observable } from 'rxjs';
import { Produit, TypeProduit, SousTypeProduit } from '../models/produit.models';

@Injectable({
    providedIn: 'root'
})
export class ProduitService {
    private apiService = inject(ApiService);

    // Boutiques
    getBoutiques(): Observable<any[]> {
        return this.apiService.getList<any[]>('boutique');
    }

    // Products
    getProduits(): Observable<Produit[]> {
        return this.apiService.getList<Produit[]>('produits');
    }

    getProduitById(id: string): Observable<Produit> {
        return this.apiService.getById<Produit>('produits', id);
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
    getTypeProduits(): Observable<TypeProduit[]> {
        return this.apiService.getList<TypeProduit[]>('type-sous-type/type-produit');
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
    getSousTypeProduits(): Observable<SousTypeProduit[]> {
        return this.apiService.getList<SousTypeProduit[]>('type-sous-type/sous-type-produit');
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
