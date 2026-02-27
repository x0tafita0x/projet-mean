import { Component, inject, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth/services/auth.service';
import { BoutiqueService } from '../boutique/services/boutique.services';
import { User } from '../auth/models/auth.models';
import { Boutique, BoutiqueNote, TypeBoutique } from '../boutique/models/boutique.models';
import { Achat } from '../achat/models/achat.models';
import { AchatService } from '../achat/services/achat.services';
import { FilterCriteria } from '../shared/models/pagination.models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {

  private authService = inject(AuthService);
  private boutiqueService = inject(BoutiqueService);
  private achatService = inject(AchatService);

  user: User | null = null;
  boutiques = signal<BoutiqueNote[]>([]);
  typeBoutiques = signal<TypeBoutique[]>([]);
  recentAchats = signal<Achat[]>([]);
  filters = signal<FilterCriteria>({
    typeBoutique: '',
    order: 'asc',
    nom: ''
  });
  private minuteTimer!: any;

  ngOnInit() {
    this.user = this.authService.currentUser();
    this.filterBoutiques();
    this.loadTypeBoutique();
    this.getRecentAchats();
    this.minuteTimer = setInterval(() => {
      this.calculerEtat();
    }, 30000);
  }
  ngOnDestroy() {
    clearInterval(this.minuteTimer);
  }

  loadBoutiques() {
    this.filterBoutiques();
  }
  loadTypeBoutique() {
    this.boutiqueService.getTypeBoutiques({ limit: 100 }).subscribe({
      next: (response) => {
        this.typeBoutiques.set(response.data);
      },
      error: (err) => console.error('Error loading boutiques', err)
    });
  }
  getTypeBoutiqueName(stype: string | TypeBoutique): string {
    if (typeof stype === 'object' && stype !== null) {
      return stype.nom;
    }
    return 'N/A';
  }

  resetFilters() {
    this.filters.set({
      typeBoutique: '',
      order: 'asc',
      nom: ''
    });
    this.filterBoutiques();
  }

  filterBoutiques() {
    this.boutiqueService.getBoutiquesNote({
      ...this.filters(),
      limit: 100
    }).subscribe({
      next: (response) => {
        this.boutiques.set(response.data);
        this.calculerEtat();
      },
      error: (err) => console.error('Error loading boutiques', err)
    });
  }
  getRecentAchats(): void {
    this.achatService.getAchatRecent(this.user?.id || '').subscribe({
      next: (data) => {
        this.recentAchats.set(data);
      },
      error: (err) => {
        console.error('Error fetching recent achats:', err);
      }
    });
  }
  calculerEtat() {
    const now = new Date();
    this.boutiques.set(this.boutiques().map(b => ({
      ...b,
      isOuverte: this.isBoutiqueOuverte(b, now)
    })))
  }
  isBoutiqueOuverte(boutique: Boutique, now: Date): boolean {
    if (!boutique.heureOuverture || !boutique.heureFermeture) {
      return false;
    }

    const currentMinutes = now.getHours() * 60 + now.getMinutes();


    const [openH, openM] = boutique.heureOuverture.split(':').map(Number);
    const openMinutes = openH * 60 + openM;

    const [closeH, closeM] = boutique.heureFermeture.split(':').map(Number);
    const closeMinutes = closeH * 60 + closeM;
    console.log(`Boutique ${boutique.nom} - Current: ${currentMinutes} min, Open: ${openMinutes} min, Close: ${closeMinutes} min = ${currentMinutes >= openMinutes && currentMinutes <= closeMinutes ? 'Ouverte' : 'Fermée'}`);

    return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
  }
  formatNbAvis(nb: number | 0): string {
  if (nb >= 1_000_000_000) return (nb / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'Md';
  if (nb >= 1_000_000)     return (nb / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (nb >= 1_000)         return (nb / 1_000).toFixed(1).replace(/\.0$/, '') + 'k';
  return nb.toString();
}
roundNote(note: number | 0) {
    return Math.round(note);
  }
}
