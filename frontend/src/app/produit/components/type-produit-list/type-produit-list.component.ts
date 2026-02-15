import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProduitService } from '../../services/produit.services';
import { TypeProduit } from '../../models/produit.models';

@Component({
  selector: 'app-type-produit-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './type-produit-list.component.html'
})
export class TypeProduitListComponent implements OnInit {
  private produitService = inject(ProduitService);
  typeProduits = signal<TypeProduit[]>([]);

  ngOnInit() {
    this.loadTypes();
  }

  loadTypes() {
    this.produitService.getTypeProduits().subscribe({
      next: (data) => this.typeProduits.set(data),
      error: (err) => console.error('Error loading types', err)
    });
  }

  deleteType(id: string) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce type de produit ?')) {
      this.produitService.deleteTypeProduit(id).subscribe({
        next: () => this.loadTypes(),
        error: (err) => alert('Erreur lors de la suppression')
      });
    }
  }
}
