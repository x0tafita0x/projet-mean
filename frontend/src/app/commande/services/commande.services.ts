import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../shared/service/api.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { Commande, CommandeDetails } from '../models/commande.models';


import { PaginatedResponse, FilterCriteria } from '../../shared/models/pagination.models';

@Injectable({
    providedIn: 'root'
})

export class CommandeService {
    private apiService = inject(ApiService);
    private dataSource = new BehaviorSubject<any>({});
    data$ = this.dataSource.asObservable();


    getCommandes(boutique: string, etat: string, filters: FilterCriteria = {}): Observable<PaginatedResponse<Commande>> {
        const params: string[] = [];
        if (filters.page) params.push(`page=${filters.page}`);
        if (filters.limit) params.push(`limit=${filters.limit}`);
        if (filters.startDate) params.push(`startDate=${filters.startDate}`);
        if (filters.endDate) params.push(`endDate=${filters.endDate}`);

        const queryString = params.length ? '?' + params.join('&') : '';
        return this.apiService.getList<PaginatedResponse<Commande>>(`achat/commandes/${boutique}/${etat}${queryString}`);
    }
    getCommandeDetails(commandeId: string, boutiqueId: string): Observable<CommandeDetails[]> {
        return this.apiService.getList<CommandeDetails[]>(`achat/commandes-details?achat=${commandeId}&boutique=${boutiqueId}`);
    }
    updateCommandeToRecuperer(achatId: string): Observable<any> {
        console.log('ID de l\'achat à mettre à jour :', achatId);
        return this.apiService.getList<any>('achat/to-recup/' + achatId);
    }

    updateCommandeToPayeEtRecupere(achatId: string): Observable<any> {
        console.log('ID de l\'achat à mettre à jour :', achatId);
        return this.apiService.getList<any>('achat/to-paye-recup/' + achatId);
    }

    cancelCommande(achatId: string): Observable<any> {
        console.log('ID de l\'achat à annuler :', achatId);
        return this.apiService.getList<any>('achat/cancel/' + achatId);
    }
}