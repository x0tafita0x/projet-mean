import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProduitService } from '../../services/produit.service';
import { Produit, SousTypeProduit } from '../../models/produit.models';

@Component({
  selector: 'app-produit-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './produit-list.component.html'
})
export class ProduitListComponent implements OnInit {
  private produitService = inject(ProduitService);
  produits = signal<Produit[]>([]);

  ngOnInit() {
    this.loadProduits();
  }

  loadProduits() {
    this.produitService.getProduits().subscribe({
      next: (data) => this.produits.set(data),
      error: (err) => console.error('Error loading products', err)
    });
  }

  deleteProduit(id: string) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      this.produitService.deleteProduit(id).subscribe({
        next: () => this.loadProduits(),
        error: (err) => alert('Erreur lors de la suppression')
      });
    }
  }

  getSousTypeName(stype: string | SousTypeProduit): string {
    if (typeof stype === 'object' && stype !== null) {
      return stype.nom;
    }
    return 'N/A';
  }

  getBoutiqueName(boutique: any): string {
    if (typeof boutique === 'object' && boutique !== null) {
      return boutique.nom;
    }
    return boutique || 'N/A';
  }
}
