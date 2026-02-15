import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../shared/service/api.service';
import { Observable } from 'rxjs';
import { StockList,StockInsert, StockResponse } from '../models/stock.models';

@Injectable({
    providedIn: 'root'
})
export class StockService {
    private apiService = inject(ApiService);

    // Boutiques
    getListeMouvementsStocks(): Observable<StockList[]> {
        return this.apiService.getList<StockList[]>('stock');
    }

     getProduits(nom : string ,boutique : string,prixMin : string,prixMax : string,sousTypeProduit : string): Observable<StockResponse[]> {
        const params: string[] = [];

        if (nom) params.push(`nom=${encodeURIComponent(nom)}`);
        if (boutique) params.push(`boutique=${encodeURIComponent(boutique)}`);
        if (prixMin) params.push(`prixMin=${encodeURIComponent(prixMin)}`);
        if (prixMax) params.push(`prixMax=${encodeURIComponent(prixMax)}`);
        if (sousTypeProduit) params.push(`sousTypeProduit=${encodeURIComponent(sousTypeProduit)}`);
         
        // Coller tous les paramètres avec '&'
        const queryString = params.length ? '?' + params.join('&') : '';

         return this.apiService.getList<StockResponse[]>(`stock/toSell${queryString}`);
     }

    createStock(produit: StockInsert | FormData): Observable<StockInsert> {
        return this.apiService.create<StockInsert>('stock', produit as any);
    }

    deleteStock(id: string): Observable<void> {
        return this.apiService.delete('stock', id);
    }

  


}
