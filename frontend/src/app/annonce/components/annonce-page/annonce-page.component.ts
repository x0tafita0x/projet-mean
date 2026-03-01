import { Component, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnnonceListComponent } from '../annonce-list/annonce-list.component';
import { AnnonceFormComponent } from '../annonce-form/annonce-form.component';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-annonce-page',
  standalone: true,
  imports: [CommonModule, AnnonceListComponent, AnnonceFormComponent],
  template: `
    <div class="p-4">
      <h2 class="mb-4">📢 Publications de la boutique</h2>
      <app-annonce-form *ngIf="isBoutique()" (annonceCreated)="onAnnonceCreated()"></app-annonce-form>
      <app-annonce-list #annonceList></app-annonce-list>
    </div>
  `
})
export class AnnoncePageComponent {
  private authService = inject(AuthService);
  user = this.authService.currentUser();

  @ViewChild('annonceList') annonceList!: AnnonceListComponent;

  isBoutique(): boolean {
    return this.user?.role === 'boutique';
  }

  onAnnonceCreated() {
    if (this.user?.boutique) {
      this.annonceList.loadAnnonces(this.user.boutique);
    }
  }
}
