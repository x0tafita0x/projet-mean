import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StockService } from '../../services/stock.services';
import { StockProduit } from '../../models/stock.models';

@Component({
  selector: 'app-stock-list-by-produit',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './stock-list-by-produit.component.html'
})
export class StockListComponentByProduit implements OnInit {
  private stockService = inject(StockService);
  stocks = signal<StockProduit[]>([]);

  ngOnInit() {
    this.loadStocks();
  }

  loadStocks() {
    this.stockService.getListeMouvementsStocksByProduit().subscribe({
      next: (data) => this.stocks.set(data),
      error: (err) => console.error('Error loading stocks', err)
    });
  }




}
