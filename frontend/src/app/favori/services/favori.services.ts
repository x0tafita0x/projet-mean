import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../shared/service/api.service';
import { Observable } from 'rxjs';
import { Favori,FavoriList } from '../models/favori.models';

@Injectable({
    providedIn: 'root'
})
export class FavoriService {
    private apiService = inject(ApiService);

    // Boutiques
    getListeFavoris(id : string | ''): Observable<FavoriList[]> {
        return this.apiService.getList<FavoriList[]>(`favori?utilisateur=${id}`);
    }

    createFavori(favori: Favori ): Observable<Favori> {
        return this.apiService.create<Favori>('favori', favori );
    }
   
    deleteFavori(id: string): Observable<void> {
        return this.apiService.delete('favori', id);
    }
    isFavoriExist(produit: string | '', utilisateur: string | ''): Observable<FavoriList[]> {
        return this.apiService.getList<FavoriList[]>(`favori?utilisateur=${utilisateur}&produit=${produit}`);
    }



}
