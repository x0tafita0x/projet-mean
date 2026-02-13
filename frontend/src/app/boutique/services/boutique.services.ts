import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../shared/service/api.service';
import { Observable } from 'rxjs';
import { Boutique, TypeBoutique } from '../models/boutique.models';

@Injectable({
    providedIn: 'root'
})
export class BoutiqueService {
    private apiService = inject(ApiService);

  // TypeBoutiques
     getTypeBoutiques(): Observable<TypeBoutique[]> {
         return this.apiService.getList<TypeBoutique[]>('type-sous-type/type-boutique');
     }
 
     getTypeBoutiqueById(id: string): Observable<TypeBoutique> {
         return this.apiService.getById<TypeBoutique>('type-sous-type/type-boutique', id);
     }
 
     createTypeBoutique(typeBoutique: TypeBoutique): Observable<TypeBoutique> {
         return this.apiService.create<TypeBoutique>('type-sous-type/type-boutique', typeBoutique);
     }
 
     updateTypeBoutique(id: string, typeBoutique: TypeBoutique): Observable<TypeBoutique> {
         return this.apiService.update<TypeBoutique>(`type-sous-type/type-boutique/${id}`, typeBoutique);
     }
 
     deleteTypeBoutique(id: string): Observable<void> {
         return this.apiService.delete('type-sous-type/type-boutique', id);
     }
 
     // Boutiques
     getBoutiques(): Observable<Boutique[]> {
         return this.apiService.getList<Boutique[]>('boutique');
     }
 
     getBoutiqueById(id: string): Observable<Boutique> {
         return this.apiService.getById<Boutique>('boutique', id);
     }
 
     createBoutique(boutique: Boutique | FormData): Observable<Boutique> {
         return this.apiService.create<Boutique>('boutique', boutique as any);
     }
 
     updateBoutique(id: string, boutique: Boutique | FormData): Observable<Boutique> {
         return this.apiService.update<Boutique>(`boutique/${id}`, boutique as any);
     }
 
     deleteBoutique(id: string): Observable<void> {
         return this.apiService.delete('boutique', id);
     }
}
