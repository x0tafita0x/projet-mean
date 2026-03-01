import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, map, firstValueFrom, filter } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Etat {
    _id: string;
    nom: string;
}

@Injectable({
    providedIn: 'root'
})
export class EtatService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/etats`;

    private etatsSubject = new BehaviorSubject<Etat[]>([]);
    etats$ = this.etatsSubject.asObservable();

    constructor() {
        this.loadEtats();
    }

    private loadEtats() {
        this.http.get<Etat[]>(this.apiUrl).subscribe(etats => {
            this.etatsSubject.next(etats);
        });
    }

    getEtats(): Observable<Etat[]> {
        return this.etats$;
    }

    async getEtatIdByNom(nom: string): Promise<string | undefined> {
        const etat = await firstValueFrom(
            this.etats$.pipe(
                filter(etats => etats.length > 0),
                map(etats => etats.find(e => e.nom === nom))
            )
        );
        return etat?._id;
    }
}
