import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../shared/service/api.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { Achat, AchatDetails } from '../models/achat.models';
import { Panier } from '../../panier/models/panier.models';
import { PaginatedResponse, FilterCriteria } from '../../shared/models/pagination.models';



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
  getAchatsByUtilisateur(utilisateurId: string | null, filters: FilterCriteria = {}): Observable<PaginatedResponse<Achat>> {
    const params: string[] = [];
    if (filters.page) params.push(`page=${filters.page}`);
    if (filters.limit) params.push(`limit=${filters.limit}`);
    if (filters.startDate) params.push(`startDate=${filters.startDate}`);
    if (filters.endDate) params.push(`endDate=${filters.endDate}`);

    const queryString = params.length ? '?' + params.join('&') : '';
    return this.apiService.getList<PaginatedResponse<Achat>>(`achat/${utilisateurId}${queryString}`);
  }
  getAchatDetails(achatId: string): Observable<AchatDetails[]> {
    return this.apiService.getList<AchatDetails[]>(`achat/achat-details/${achatId}`);
  }
  getAchatRecent(id : string | ''): Observable<Achat[]> {
    return this.apiService.getList<Achat[]>(`achat/recent?client=${id}`);
  }
  annulerAchat(achatInfoId: string): Observable<void> {
    return this.apiService.getById('achat/to-annule', achatInfoId);
  }

}