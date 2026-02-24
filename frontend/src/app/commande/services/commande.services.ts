import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../shared/service/api.service';
import { Observable,BehaviorSubject } from 'rxjs';
import { Commande } from '../models/commande.models';



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

}