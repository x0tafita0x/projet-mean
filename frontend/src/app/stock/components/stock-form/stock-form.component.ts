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
import { User } from '../../../auth/models/auth.models';
import { AuthService } from '../../../auth/services/auth.service';

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

  stock = signal<StockInsert>({ produit:'', in: '', out: '', prix: '' , boutique: ''});
  mouvementPrixProduit = signal<MouvementPrixProduitInsert>({ produit: '', prix: '0' });
  produits = signal<Produit[]>([]);
  loading = signal(false);
  selectedFile: File | null = null;
  user : User | null = null;
  private authService = inject(AuthService);

  ngOnInit() {
    this.loadMetadata();
this.user = this.authService.currentUser();

}

loadMetadata(){
    this.produitService.getProduits('','', this.user?.boutique || '', '', 'asc').subscribe({
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
    
   
  this.stock.set({
    produit: this.stock().produit,
    in: this.stock().in,
    out: this.stock().out,
    prix: this.stock().prix,
    boutique: this.user?.boutique || ''
  });

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
