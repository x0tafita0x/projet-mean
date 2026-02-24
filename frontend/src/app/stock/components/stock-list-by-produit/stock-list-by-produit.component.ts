import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StockService } from '../../services/stock.services';
import { StockProduit } from '../../models/stock.models';
import { AuthService } from '../../../auth/services/auth.service';
import { User } from '../../../auth/models/auth.models';

@Component({
  selector: 'app-stock-list-by-produit',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './stock-list-by-produit.component.html'
})
export class StockListComponentByProduit implements OnInit {
  private stockService = inject(StockService);
  stocks = signal<StockProduit[]>([]);
  user : User | null = null;
  authService = inject(AuthService);

  ngOnInit() {
    this.user = this.authService.currentUser();
    this.loadStocks();
  }

  loadStocks() {
    this.stockService.getListeMouvementsStocksByProduit(this.user?.boutique || '').subscribe({
      next: (data) => this.stocks.set(data),
      error: (err) => console.error('Error loading stocks', err)
    });
  }




}
