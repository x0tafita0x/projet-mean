import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { StockService } from '../../services/stock.services';
import { ProduitService } from '../../../produit/services/produit.services';
import { StockInsert } from '../../models/stock.models';
import { Produit } from '../../../produit/models/produit.models';

@Component({
  selector: 'app-stock-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './stock-form.component.html'
})
export class StockFormComponent implements OnInit {
  private stockService = inject(StockService);
  private produitService = inject(ProduitService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  stock = signal<StockInsert>({ produit:'', in: '', out: '' });
  produits = signal<Produit[]>([]);
  loading = signal(false);
  selectedFile: File | null = null;

  ngOnInit() {
    this.loadMetadata();


}

loadMetadata(){
    this.produitService.getProduits('','','', '', 'asc').subscribe({
      next: (data) => this.produits.set(data),
      error: (err) => console.error('Error loading produits', err)
    });
}
  save() {
    this.loading.set(true);
    const formData = new FormData();
    formData.append('produit', (this.stock().produit as string) || '');
    formData.append('in', this.stock().in || '0');
    formData.append('out', this.stock().out || '0');

   


    const obs =  this.stockService.createStock(formData);

    obs.subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/home/stock']);
      },
      error: (err) => {
        this.loading.set(false);
        alert('Erreur lors de l\'enregistrement');
      }
    });
  }
}
