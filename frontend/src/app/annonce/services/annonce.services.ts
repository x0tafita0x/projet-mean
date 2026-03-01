import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Annonce } from '../models/annonce.models';
import { environment } from '../../../environments/environment';
import { FilterCriteria, PaginatedResponse } from '../../shared/models/pagination.models';

@Injectable({
    providedIn: 'root'
})
export class AnnonceService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/annonce`;

    getAnnonces(criteria: FilterCriteria): Observable<PaginatedResponse<Annonce>> {
        let params = new HttpParams();
        Object.keys(criteria).forEach(key => {
            if (criteria[key]) {
                params = params.append(key, criteria[key].toString());
            }
        });
        return this.http.get<PaginatedResponse<Annonce>>(this.apiUrl, { params });
    }

    createAnnonce(formData: FormData): Observable<Annonce> {
        return this.http.post<Annonce>(this.apiUrl, formData);
    }

    deleteAnnonce(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }
}
