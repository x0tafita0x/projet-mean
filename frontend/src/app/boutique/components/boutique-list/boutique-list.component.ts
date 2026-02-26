import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BoutiqueService } from '../../services/boutique.services';
import { Boutique, TypeBoutique } from '../../models/boutique.models';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { FilterCriteria } from '../../../shared/models/pagination.models';

@Component({
  selector: 'app-boutique-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, PaginationComponent],
  templateUrl: './boutique-list.component.html'
})
export class BoutiqueListComponent implements OnInit {
  private boutiqueService = inject(BoutiqueService);
  boutiques = signal<Boutique[]>([]);
  totalItems = signal(0);
  currentPage = signal(1);
  pageSize = signal(10);

  filters = signal<FilterCriteria>({
    nom: '',
    typeBoutique: '',
    startDate: '',
    endDate: '',
    order: 'asc'
  });

  typeBoutiques = signal<TypeBoutique[]>([]);

  ngOnInit() {
    this.loadBoutiques();
    this.loadTypes();
  }

  loadTypes() {
    this.boutiqueService.getTypeBoutiques({ limit: 100 }).subscribe(res => this.typeBoutiques.set(res.data));
  }

  resetFilters() {
    this.filters.set({
      nom: '',
      typeBoutique: '',
      startDate: '',
      endDate: '',
      order: 'asc'
    });
    this.applyFilters();
  }

  updateFilters(key: string, value: any) {
    this.filters.update(prev => ({ ...prev, [key]: value }));
  }

  loadBoutiques() {
    const criteria: FilterCriteria = {
      ...this.filters(),
      page: this.currentPage(),
      limit: this.pageSize()
    };

    this.boutiqueService.getBoutiques(criteria).subscribe({
      next: (response) => {
        this.boutiques.set(response.data);
        this.totalItems.set(response.total);
      },
      error: (err) => console.error('Error loading boutiques', err)
    });
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadBoutiques();
  }

  applyFilters() {
    this.currentPage.set(1);
    this.loadBoutiques();
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
