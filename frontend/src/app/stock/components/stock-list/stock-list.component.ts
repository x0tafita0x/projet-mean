import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StockService } from '../../services/stock.services';
import { StockList } from '../../models/stock.models';
import { Produit, SousTypeProduit } from '../../../produit/models/produit.models';
import { User } from '../../../auth/models/auth.models';
import { AuthService } from '../../../auth/services/auth.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { FilterCriteria } from '../../../shared/models/pagination.models';

@Component({
  selector: 'app-stock-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, PaginationComponent],
  templateUrl: './stock-list.component.html'
})
export class StockListComponent implements OnInit {
  private stockService = inject(StockService);
  stocks = signal<StockList[]>([]);
  totalItems = signal(0);
  currentPage = signal(1);
  pageSize = signal(10);

  filters = signal<FilterCriteria>({
    search: '',
    startDate: '',
    endDate: ''
  });

  authService = inject(AuthService);
  user: User | null = null;

  ngOnInit() {
    this.user = this.authService.currentUser();
    this.loadStocks();
  }

  loadStocks() {
    const criteria: FilterCriteria = {
      ...this.filters(),
      boutiqueId: this.user?.boutique || '',
      page: this.currentPage(),
      limit: this.pageSize()
    };

    this.stockService.getListeMouvementsStocks(criteria).subscribe({
      next: (response) => {
        this.stocks.set(response.data);
        this.totalItems.set(response.total);
      },
      error: (err) => console.error('Error loading stocks', err)
    });
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadStocks();
  }

  applyFilters() {
    this.currentPage.set(1);
    this.loadStocks();
  }

  resetFilters() {
    this.filters.set({
      search: '',
      startDate: '',
      endDate: ''
    });
    this.applyFilters();
  }

  updateFilters(key: string, value: any) {
    this.filters.update(prev => ({ ...prev, [key]: value }));
  }



  getSousTypeName(stype: string | SousTypeProduit): string {
    if (typeof stype === 'object' && stype !== null) {
      return stype.nom;
    }
    return 'N/A';
  }

  getProduitName(produit: Produit): string {
    if (typeof produit === 'object' && produit !== null) {
      return produit.nom;
    }
    return produit || 'N/A';
  }
}
