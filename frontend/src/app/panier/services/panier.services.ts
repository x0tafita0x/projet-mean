import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../shared/service/api.service';
import { Observable,BehaviorSubject } from 'rxjs';
import { Panier, PanierList } from '../models/panier.models';



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

}