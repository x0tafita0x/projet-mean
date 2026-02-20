import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../shared/service/api.service';
import { Observable } from 'rxjs';
import { MouvementPrixProduit,MouvementPrixProduitByProduit,MouvementPrixProduitInsert } from '../models/mouvement-prix-produit.models';


@Injectable({
    providedIn: 'root'
})

export class MouvementPrixProduitService {
    private apiService = inject(ApiService);

    createMouvementPrixProduit(mouvementPrixProduit: MouvementPrixProduitInsert): Observable<MouvementPrixProduitInsert> {
            return this.apiService.create<MouvementPrixProduitInsert>('mouvements-prix-produit', mouvementPrixProduit);
    }

    getMouvementsPrixByProduit(produitId: string): Observable<MouvementPrixProduit[]> {
        return this.apiService.getList<MouvementPrixProduit[]>(`mouvements-prix-produit?produitId=${encodeURIComponent(produitId)}`);
    }
    getLastMouvementPrixByProduit(produitId: string): Observable<MouvementPrixProduit> {
        return this.apiService.getList<MouvementPrixProduit>('mouvements-prix-produit/last/'+produitId);
    }
   
    getPrixActuelByProduit(): Observable<MouvementPrixProduitByProduit[]> {
        return this.apiService.getList<MouvementPrixProduitByProduit[]>('mouvements-prix-produit/prix-actuel/');
    }

}