import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BoutiqueService } from '../../services/boutique.services';
import { TypeBoutique } from '../../models/boutique.models';

@Component({
  selector: 'app-type-boutique-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './type-boutique-list.component.html'
})
export class TypeBoutiqueListComponent implements OnInit {
  private produitService = inject(BoutiqueService);
  typeBoutiques = signal<TypeBoutique[]>([]);

  ngOnInit() {
    this.loadTypes();
  }

  loadTypes() {
    this.produitService.getTypeBoutiques().subscribe({
      next: (data) => this.typeBoutiques.set(data),
      error: (err) => console.error('Error loading types', err)
    });
  }

  deleteType(id: string) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce type de boutique ?')) {
      this.produitService.deleteTypeBoutique(id).subscribe({
        next: () => this.loadTypes(),
        error: (err) => alert('Erreur lors de la suppression')
      });
    }
  }
}
