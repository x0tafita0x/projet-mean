import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../shared/service/api.service';
import { Observable,BehaviorSubject } from 'rxjs';
import { AvisNote,AvisNoteList } from '../models/avis-note.models';



@Injectable({
    providedIn: 'root'
})

export class AvisNoteService {
    private apiService = inject(ApiService);

    
   // Avis Note
       getAvisNotes(): Observable<AvisNoteList[]> {
           return this.apiService.getList<AvisNoteList[]>('avis-note');
       }
   
       getAvisNoteById(id: string): Observable<AvisNoteList> {
           return this.apiService.getById<AvisNoteList>('avis-note', id);
       }
   
       createAvisNote(avisNote: AvisNote): Observable<AvisNote> {
           return this.apiService.create<AvisNote>('avis-note', avisNote);
       }    
         
       getAvisNoteByUserAndBoutique(userId: string, boutiqueId: string): Observable<AvisNote> {
           return this.apiService.getSingle<AvisNote>(`avis-note/individu?utilisateur=${userId}&boutique=${boutiqueId}`);
       }
   
       updateAvisNote(id: string, avisNote: AvisNote): Observable<AvisNote> {
        console.log(`Updating avis-note ${id} with data`, avisNote);
           return this.apiService.update<AvisNote>(`avis-note/${id}`, avisNote);
       }
   
       deleteAvisNote(id: string): Observable<void> {
           return this.apiService.delete('avis-note', id);
       }

}