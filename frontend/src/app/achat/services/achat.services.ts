import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../shared/service/api.service';
import { Observable,BehaviorSubject } from 'rxjs';
import { Achat, AchatDetails } from '../models/achat.models';
import { Panier } from '../../panier/models/panier.models';



@Injectable({
    providedIn: 'root'
})

export class AchatService {
    private apiService = inject(ApiService);
    private dataSource = new BehaviorSubject<any>({});
    data$ = this.dataSource.asObservable();

   createAchat(panier: Panier[]): void {
  console.log('Creating achat with data:', panier);

  this.apiService.create<Panier[]>('achat', panier).subscribe({
    next: (res) => {
      console.log('Achat créé avec succès', res);
    },
    error: (err) => {
      console.error('Erreur lors de la création de l\'achat', err);
    }
  });
}

    getAchatById(achatId: string): Observable<Achat> {
        return this.apiService.getById<Achat>('achat/achat', achatId);
    }
    getAchatsByUtilisateur(utilisateurId: string | null): Observable<Achat[]> {
        return this.apiService.getList<Achat[]>(`achat/${utilisateurId}`);
    }
    getAchatDetails(achatId: string): Observable<AchatDetails[]> {
        return this.apiService.getList<AchatDetails[]>(`achat/achat-details/${achatId}`);
    }
    getAchatRecent(): Observable<Achat[]> {
        return this.apiService.getList<Achat[]>(`achat/recent`);
    }

}