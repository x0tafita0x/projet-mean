import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StockService } from '../../services/stock.services';
import { StockList } from '../../models/stock.models';
import { Produit, SousTypeProduit } from '../../../produit/models/produit.models';

@Component({
  selector: 'app-stock-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './stock-list.component.html'
})
export class StockListComponent implements OnInit {
  private stockService = inject(StockService);
  stocks = signal<StockList[]>([]);

  ngOnInit() {
    this.loadStocks();
  }

  loadStocks() {
    this.stockService.getListeMouvementsStocks().subscribe({
      next: (data) => this.stocks.set(data),
      error: (err) => console.error('Error loading stocks', err)
    });
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
