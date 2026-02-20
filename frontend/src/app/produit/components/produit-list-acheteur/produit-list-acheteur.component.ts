import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { Router, RouterModule,ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms'; 
import { ProduitService } from '../../services/produit.services';
import { Produit ,ProduitDetail, SousTypeProduit } from '../../../produit/models/produit.models';
import { StockResponse } from '../../../stock/models/stock.models';
import { StockService } from '../../../stock/services/stock.services';
import { PanierService } from '../../../panier/services/panier.services';
import { AuthService } from '../../../auth/services/auth.service';
import { User } from '../../../auth/models/auth.models';

@Component({
  selector: 'app-home',
  standalone:true,
  imports: [CommonModule,FormsModule,RouterModule],
  templateUrl: './produit-list-acheteur.component.html',
  styleUrl: './produit-list-acheteur.component.css'
})
export class ProduitListAcheteurComponent {

    private produitService = inject(ProduitService);  
    private stockService = inject(StockService);
    private panierService = inject(PanierService);
    private route = inject(ActivatedRoute);
    private authService = inject(AuthService);

    user : User | null = null;
    produitSelectionne = signal<ProduitDetail>({ _id: '', nom: '', sousTypeProduit: { _id: '', nom: '', typeProduit: { _id: '', nom: '' } }, boutique: { _id: '', nom: '' } });
    panierItem = signal({ utilisateur: '', produit: '', prix: 0, quantite: 1, etat: 'en cours', typeCommande: 'normal' });
    showDetails = signal(false);
    produits = signal<StockResponse[]>([]);
    sousTypeProduits = signal<SousTypeProduit[]>([]);
    prixProduit = signal<string>('0');

    typeBoutique : string = '';
    order : string = 'asc';

ngOnInit() {
  this.user = this.authService.currentUser();
    const id = this.route.snapshot.paramMap.get('id');
this.loadProduits(id);
this.loadSousTypeProduits();
}

 loadProduits(id: string | null) {
    this.stockService.getProduits('',id || '','','','').subscribe({
      next: (data) => this.produits.set(data),
      error: (err) => console.error('Error loading produits', err)
    });
  }
  loadSousTypeProduits(){
    this.produitService.getSousTypeProduits().subscribe({
      next: (data) => this.sousTypeProduits.set(data),
      error: (err) => console.error('Error loading sous type produits', err)
    });
  }
  getSousTypeProduitName(stype: string | SousTypeProduit): string {
    if (typeof stype === 'object' && stype !== null) {
      return stype.nom;
    }
    return 'N/A';
  }

  loadProduitsDetails(id: string | null) {
    this.produitService.getProduitById(id).subscribe({
      next: (data) => this.produitSelectionne.set(data),
      error: (err) => console.error(err)
    });
  }

  selectProduit(produit: StockResponse) {
    this.loadProduitsDetails(produit._id as string || null);
    this.prixProduit.set(produit.prixUnitaire || '0');
    this.putData(produit, produit.prixUnitaire || '0');
    this.showDetails.set(true);
  }

  fermerDetails() {
    this.showDetails.set(false);
    this.produitSelectionne.set({ _id: '', nom: '', sousTypeProduit: { _id: '', nom: '', typeProduit: { _id: '', nom: '' } }, boutique: { _id: '', nom: '' } });
  }

  putData(produit : StockResponse , prix : string){
    this.panierItem.set({
      utilisateur: this.user?.id || '', 
      produit: produit._id || '',
      prix: parseFloat(prix),
      quantite: this.panierItem().quantite,
      etat: '6997d94d319cef48fa23a80f',
      typeCommande: 'normal'
    });
  }

  addToPanier() {
    
    const item = this.panierItem();
    this.panierService.createPanier(item).subscribe({
      next: (data) => alert('Produit ajouté au panier avec succès !'),
      error: (err) => console.error('Error creating panier:', err)
    });
  }

//     });
//   }
  


}
