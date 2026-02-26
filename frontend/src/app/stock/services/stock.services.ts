import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../shared/service/api.service';
import { Observable } from 'rxjs';
import { StockList, StockInsert, StockResponse, StockProduit } from '../models/stock.models';
import { PaginatedResponse, FilterCriteria } from '../../shared/models/pagination.models';

@Injectable({
    providedIn: 'root'
})
export class StockService {
    private apiService = inject(ApiService);

    // Boutiques
    getListeMouvementsStocks(filters: FilterCriteria = {}): Observable<PaginatedResponse<StockList>> {
        const params: string[] = [];
        if (filters.boutiqueId) params.push(`boutique=${filters.boutiqueId}`);
        if (filters.page) params.push(`page=${filters.page}`);
        if (filters.limit) params.push(`limit=${filters.limit}`);
        if (filters.startDate) params.push(`startDate=${filters.startDate}`);
        if (filters.endDate) params.push(`endDate=${filters.endDate}`);
        if (filters.search) params.push(`search=${filters.search}`);

        const queryString = params.length ? '?' + params.join('&') : '';
        return this.apiService.getList<PaginatedResponse<StockList>>(`stock${queryString}`);
    }

    getProduits(filters: FilterCriteria = {}): Observable<PaginatedResponse<StockResponse>> {
        const params: string[] = [];

        if (filters.nom) params.push(`nom=${encodeURIComponent(filters.nom)}`);
        if (filters.boutiqueId) params.push(`boutique=${encodeURIComponent(filters.boutiqueId)}`);
        if (filters.prixMin) params.push(`prixMin=${encodeURIComponent(filters.prixMin)}`);
        if (filters.prixMax) params.push(`prixMax=${encodeURIComponent(filters.prixMax)}`);
        if (filters.sousTypeProduitId) params.push(`sousTypeProduit=${encodeURIComponent(filters.sousTypeProduitId)}`);
        if (filters.page) params.push(`page=${filters.page}`);
        if (filters.limit) params.push(`limit=${filters.limit}`);

        const queryString = params.length ? '?' + params.join('&') : '';

        return this.apiService.getList<PaginatedResponse<StockResponse>>(`stock/toSell${queryString}`);
    }

    createStock(stock: StockInsert): Observable<StockInsert> {
        return this.apiService.create<StockInsert>('stock', stock);
    }
    createStocks(stocks: StockInsert[]): Observable<StockInsert[]> {
        return this.apiService.create<StockInsert[]>('stock/multiple', stocks);
    }

    deleteStock(id: string): Observable<void> {
        return this.apiService.delete('stock', id);
    }

    getListeMouvementsStocksByProduit(boutique: string | ''): Observable<StockProduit[]> {
        return this.apiService.getList<StockProduit[]>(`stock/produits-avec-stock?boutique=${boutique}`);
    }

    getStockById(id: string | ''): Observable<StockProduit[]> {
        return this.apiService.getList<StockProduit[]>(`stock/produits-avec-stock?id=${id}`);
    }


}
