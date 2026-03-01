import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../shared/service/api.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { Panier, PanierList, Etat } from '../models/panier.models';
import { TypeBoutique } from '../../boutique/models/boutique.models';



@Injectable({
    providedIn: 'root'
})

export class PanierService {
    private apiService = inject(ApiService);
    private dataSource = new BehaviorSubject<any>({});
    data$ = this.dataSource.asObservable();

    createPanier(panier: Panier): Observable<Panier> {
        return this.apiService.create<Panier>('panier', panier);
    }

    getPaniersByUtilisateur(utilisateurId: string | null): Observable<PanierList[]> {
        return this.apiService.getList<PanierList[]>(`panier?utilisateur=${encodeURIComponent(utilisateurId || '')}`);
    }
    updatePanier(id: string, panier: Panier): Observable<Panier> {
        console.log('Updating panier with ID:', id, 'Data:', panier);
        return this.apiService.update<Panier>(`panier/${id}`, panier);
    }

    deletePanier(id: string): Observable<void> {
        return this.apiService.delete('panier', id);
    }
    sendData(data: any) {
        this.dataSource.next(data);
    }

    isPanierVide(utilisateurId: string): Observable<{ isEmpty: boolean }> {
        return this.apiService.getById<{ isEmpty: boolean }>('panier/is-panier-vide', utilisateurId);
    }

    // Etat
    getEtats(): Observable<Etat[]> {
        return this.apiService.getList<Etat[]>('etats');
    }

    getEtatById(id: string): Observable<Etat> {
        return this.apiService.getById<Etat>('etats', id);
    }

    createEtat(etat: Etat): Observable<Etat> {
        return this.apiService.create<Etat>('etats', etat);
    }

    updateEtat(id: string, etat: Etat): Observable<Etat> {
        return this.apiService.update<Etat>(`etats/${id}`, etat);
    }

    deleteEtat(id: string): Observable<void> {
        return this.apiService.delete('etats', id);
    }

}