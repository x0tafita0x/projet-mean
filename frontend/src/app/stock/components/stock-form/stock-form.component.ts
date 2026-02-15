import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { StockService } from '../../services/stock.services';
import { ProduitService } from '../../../produit/services/produit.services';
import { MouvementPrixProduitService } from '../../../mouvement-prix-produit/services/mouvement-prix-produit.services';
import { StockInsert } from '../../models/stock.models';
import { Produit } from '../../../produit/models/produit.models';
import { MouvementPrixProduitInsert } from '../../../mouvement-prix-produit/models/mouvement-prix-produit.models';

@Component({
  selector: 'app-stock-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './stock-form.component.html'
})
export class StockFormComponent implements OnInit {
  private stockService = inject(StockService);
  private produitService = inject(ProduitService);
  private mouvementPrixProduitService = inject(MouvementPrixProduitService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  stock = signal<StockInsert>({ produit:'', in: '', out: '', prix: '' });
  mouvementPrixProduit = signal<MouvementPrixProduitInsert>({ produit: '', prix: '0' });
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

if (this.stock().in && parseFloat(this.stock().in || '0') !== 0) {
  
    this.mouvementPrixProduit.set({
      produit: this.stock().produit as string,
      prix: this.stock().prix  || '0'
    });

  this.mouvementPrixProduitService.createMouvementPrixProduit(this.mouvementPrixProduit()).subscribe({
      next: (data) => console.log('MouvementPrixProduit created', data),
      error: (err) => console.error('Error creating MouvementPrixProduit', err)
    });
  }
    
   


    const obs =  this.stockService.createStock(this.stock());

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
