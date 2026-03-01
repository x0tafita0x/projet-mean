import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MouvementPrixProduitService } from '../../services/mouvement-prix-produit.services';
import { MouvementPrixProduit } from '../../models/mouvement-prix-produit.models';
import { User } from '../../../auth/models/auth.models';
import { AuthService } from '../../../auth/services/auth.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { FilterCriteria } from '../../../shared/models/pagination.models';

@Component({
  selector: 'app-mouvement-prix-produit-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, PaginationComponent],
  templateUrl: './mouvement-prix-produit-list.component.html'
})
export class MouvementPrixProduitListComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private mouvementPrixProduitService = inject(MouvementPrixProduitService);
  private authService = inject(AuthService);

  mouvementsPrixProduits = signal<MouvementPrixProduit[]>([]);
  totalItems = signal(0);
  currentPage = signal(1);
  pageSize = signal(10);

  filters = signal<FilterCriteria>({
    startDate: '',
    endDate: '',
    search: ''
  });

  user: User | null = null;

  ngOnInit() {
    this.user = this.authService.currentUser();
    this.loadMouvementsPrixProduits();
  }

  loadMouvementsPrixProduits() {
    const boutiqueId = this.user?.boutique || '';
    const criteria: FilterCriteria = {
      ...this.filters(),
      page: this.currentPage(),
      limit: this.pageSize()
    };

    this.mouvementPrixProduitService.getMouvementsPrixByProduit(boutiqueId, criteria).subscribe({
      next: (response) => {
        this.mouvementsPrixProduits.set(response.data);
        this.totalItems.set(response.total);
      },
      error: (err) => console.error('Error loading mouvements prix produits', err)
    });
  }

  applyFilters() {
    this.currentPage.set(1);
    this.loadMouvementsPrixProduits();
  }

  resetFilters() {
    this.filters.set({
      startDate: '',
      endDate: '',
      search: ''
    });
    this.applyFilters();
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadMouvementsPrixProduits();
  }
}
