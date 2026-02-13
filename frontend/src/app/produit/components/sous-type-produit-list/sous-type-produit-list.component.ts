import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProduitService } from '../../services/produit.service';
import { SousTypeProduit, TypeProduit } from '../../models/produit.models';

@Component({
  selector: 'app-sous-type-produit-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './sous-type-produit-list.component.html'
})
export class SousTypeProduitListComponent implements OnInit {
  private produitService = inject(ProduitService);
  sousTypeProduits = signal<SousTypeProduit[]>([]);

  ngOnInit() {
    this.loadSousTypes();
  }

  loadSousTypes() {
    this.produitService.getSousTypeProduits().subscribe({
      next: (data) => this.sousTypeProduits.set(data),
      error: (err) => console.error('Error loading sous-types', err)
    });
  }

  deleteSousType(id: string) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce sous-type ?')) {
      this.produitService.deleteSousTypeProduit(id).subscribe({
        next: () => this.loadSousTypes(),
        error: (err) => alert('Erreur lors de la suppression')
      });
    }
  }

  getTypeName(type: string | TypeProduit): string {
    if (typeof type === 'object' && type !== null) {
      return type.nom;
    }
    return 'N/A';
  }
}
