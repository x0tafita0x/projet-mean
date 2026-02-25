import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../shared/service/api.service';
import { Observable,BehaviorSubject } from 'rxjs';
import { Commande, CommandeDetails } from '../models/commande.models';



@Injectable({
    providedIn: 'root'
})

export class CommandeService {
    private apiService = inject(ApiService);
    private dataSource = new BehaviorSubject<any>({});
    data$ = this.dataSource.asObservable();


   getCommandes(boutique: string): Observable<Commande[]> {
        return this.apiService.getList<Commande[]>(`achat/commandes/${boutique}`);
    }
    getCommandeDetails(commandeId: string, boutiqueId: string): Observable<CommandeDetails[]> {
        return this.apiService.getList<CommandeDetails[]>(`achat/commandes-details?achat=${commandeId}&boutique=${boutiqueId}`);
     }
    updateCommandeToRecuperer(achatId: string): Observable<any> {
        console.log('ID de l\'achat à mettre à jour :', achatId);
        return this.apiService.getList<any>('achat/to-recup/' + achatId);
     }
    

}