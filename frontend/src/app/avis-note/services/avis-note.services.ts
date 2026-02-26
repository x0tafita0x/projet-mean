import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../shared/service/api.service';
import { Observable,BehaviorSubject } from 'rxjs';
import { avisNote,avisNoteList } from '../models/avis-note.models';



@Injectable({
    providedIn: 'root'
})

export class AvisNoteService {
    private apiService = inject(ApiService);

    
   // Avis Note
       getAvisNotes(): Observable<avisNoteList[]> {
           return this.apiService.getList<avisNoteList[]>('avis-note');
       }
   
       getAvisNoteById(id: string): Observable<avisNoteList> {
           return this.apiService.getById<avisNoteList>('avis-note', id);
       }
   
       createAvisNote(avisNote: avisNote): Observable<avisNote> {
           return this.apiService.create<avisNote>('avis-note', avisNote);
       }    
         
   
   
       updateAvisNote(id: string, avisNote: avisNote): Observable<avisNote> {
           return this.apiService.update<avisNote>(`avis-note/${id}`, avisNote);
       }
   
       deleteAvisNote(id: string): Observable<void> {
           return this.apiService.delete('avis-note', id);
       }

}