import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProduitService } from '../../services/produit.services';
import { TypeProduit } from '../../models/produit.models';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { FilterCriteria } from '../../../shared/models/pagination.models';

@Component({
  selector: 'app-type-produit-list',
  standalone: true,
  imports: [CommonModule, RouterLink, PaginationComponent],
  templateUrl: './type-produit-list.component.html'
})
export class TypeProduitListComponent implements OnInit {
  private produitService = inject(ProduitService);
  typeProduits = signal<TypeProduit[]>([]);
  totalItems = signal(0);
  currentPage = signal(1);
  pageSize = signal(10);

  ngOnInit() {
    this.loadTypes();
  }

  loadTypes() {
    const filters: FilterCriteria = {
      page: this.currentPage(),
      limit: this.pageSize()
    };
    this.produitService.getTypeProduits(filters).subscribe({
      next: (response) => {
        this.typeProduits.set(response.data);
        this.totalItems.set(response.total);
      },
      error: (err) => console.error('Error loading types', err)
    });
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadTypes();
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
