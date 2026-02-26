import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BoutiqueService } from '../../services/boutique.services';
import { TypeBoutique } from '../../models/boutique.models';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { FilterCriteria } from '../../../shared/models/pagination.models';

@Component({
  selector: 'app-type-boutique-list',
  standalone: true,
  imports: [CommonModule, RouterLink, PaginationComponent],
  templateUrl: './type-boutique-list.component.html'
})
export class TypeBoutiqueListComponent implements OnInit {
  private boutiqueService = inject(BoutiqueService);
  typeBoutiques = signal<TypeBoutique[]>([]);
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
    this.boutiqueService.getTypeBoutiques(filters).subscribe({
      next: (response) => {
        this.typeBoutiques.set(response.data);
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
    if (confirm('Êtes-vous sûr de vouloir supprimer ce type de boutique ?')) {
      this.boutiqueService.deleteTypeBoutique(id).subscribe({
        next: () => this.loadTypes(),
        error: (err) => alert('Erreur lors de la suppression')
      });
    }
  }
}
