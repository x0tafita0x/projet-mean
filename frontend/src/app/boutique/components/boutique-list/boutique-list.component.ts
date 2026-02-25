import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BoutiqueService } from '../../services/boutique.services';
import { Boutique, TypeBoutique } from '../../models/boutique.models';

@Component({
  selector: 'app-boutique-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './boutique-list.component.html'
})
export class BoutiqueListComponent implements OnInit {
  private boutiqueService = inject(BoutiqueService);
  boutiques = signal<Boutique[]>([]);

  ngOnInit() {
    this.loadBoutiques();
  }

  loadBoutiques() {
    this.boutiqueService.getBoutiques('','','','asc').subscribe({
      next: (data) => this.boutiques.set(data),
      error: (err) => console.error('Error loading boutiques', err)
    });
  }

  deleteBoutique(id: string) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette boutique ?')) {
      this.boutiqueService.deleteBoutique(id).subscribe({
        next: () => this.loadBoutiques(),
        error: (err) => alert('Erreur lors de la suppression')
      });
    }
  }

  getTypeBoutiqueName(stype: string | TypeBoutique): string {
    if (typeof stype === 'object' && stype !== null) {
      return stype.nom;
    }
    return 'N/A';
  }

}
