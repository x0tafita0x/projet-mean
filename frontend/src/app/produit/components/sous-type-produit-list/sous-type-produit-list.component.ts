import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProduitService } from '../../services/produit.services';
import { SousTypeProduit, TypeProduit } from '../../models/produit.models';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { FilterCriteria } from '../../../shared/models/pagination.models';

@Component({
  selector: 'app-sous-type-produit-list',
  standalone: true,
  imports: [CommonModule, RouterLink, PaginationComponent],
  templateUrl: './sous-type-produit-list.component.html'
})
export class SousTypeProduitListComponent implements OnInit {
  private produitService = inject(ProduitService);
  sousTypeProduits = signal<SousTypeProduit[]>([]);
  totalItems = signal(0);
  currentPage = signal(1);
  pageSize = signal(10);

  ngOnInit() {
    this.loadSousTypes();
  }

  loadSousTypes() {
    const filters: FilterCriteria = {
      page: this.currentPage(),
      limit: this.pageSize()
    };
    this.produitService.getSousTypeProduits(filters).subscribe({
      next: (response) => {
        this.sousTypeProduits.set(response.data);
        this.totalItems.set(response.total);
      },
      error: (err) => console.error('Error loading sous-types', err)
    });
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadSousTypes();
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
