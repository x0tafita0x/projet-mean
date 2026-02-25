import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink,Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PanierService } from '../../services/panier.services';
import { Panier, PanierList } from '../../models/panier.models';
import { AuthService } from '../../../auth/services/auth.service';
import { User } from '../../../auth/models/auth.models';
import { StockService } from '../../../stock/services/stock.services';

@Component({
  selector: 'app-panier-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './panier-list.component.html',
  styleUrl: './panier-list.component.css'
})
export class PanierListComponent implements OnInit {
  private panierService = inject(PanierService);
     private authService = inject(AuthService);
     private router = inject(Router);
     private stockService = inject(StockService);
  canValidate = signal(false);
  paniers = signal<PanierList[]>([]);
  panierUpdated = signal<Panier>({ utilisateur: '', produit: '', prix: 0, quantite: 1, etat: 'en cours', typeCommande: 'normal' });
  PaniertoValidate = signal<Panier[]>([]);
    user : User | null = null;
    max_stock = signal<number>(0);



  ngOnInit() {
      this.user = this.authService.currentUser();
    this.loadPanier();
  }

  loadPanier() {
    this.panierService.getPaniersByUtilisateur(this.user?.id || null).subscribe({
      next: (data) => this.paniers.set(data),
      error: (err) => console.error('Error loading panier items', err)
    });
  }

  deletePanier(id: string) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce panier ?')) {
      this.panierService.deletePanier(id).subscribe({
        next: () => this.loadPanier(),
        error: (err) => alert('Erreur lors de la suppression')
      });
    }
  }


  editPanier(panier: PanierList) {
    if (!panier.edit) {
      panier.edit = true;
    }else{
      panier.edit = false;
    }
    this.getStockById(panier.produit._id as string || '');

  }

  validerModifPanier(panier: PanierList) {
     if (this.panierUpdated().quantite > this.max_stock()) {
      alert(`Quantité demandée dépasse le stock disponible (${this.max_stock()}).`);
      return;
    }else if (this.panierUpdated().quantite < 1) {
      alert(`Quantité doit être au moins 1.`);
      return;
    }

    if (confirm('Êtes-vous sûr de vouloir modifier ce panier ?')) {
     this.panierUpdated.set({
        utilisateur: panier.utilisateur,
        produit: panier.produit._id,
        prix: panier.prixActuel,
        quantite: this.panierUpdated().quantite,
        etat: 'validé',
        typeCommande: panier.typeCommande
      });
      this.panierService.updatePanier(panier._id!, this.panierUpdated()).subscribe({
        next: () => this.loadPanier(),
        error: (err) => alert('Erreur lors de la validation')
      });
    }
    }

    selectAll() {
      this.canValidate.set(true);
  this.paniers.update(list =>
    list.map(p => ({ ...p, selected: true }))
  );
}

  deSelectAll() {
    this.canValidate.set(false);
    this.paniers.update(list =>
      list.map(p => ({ ...p, selected: false }))
    );
  }

  check(selected: PanierList) {
    selected.selected = !selected.selected;
    const anySelected = this.paniers().some(p => p.selected);
      this.canValidate.set(anySelected);  
  }

  validerPanier() {
    const paniersToValidateIntermedaire = this.paniers().filter(p => p.selected);
    if (paniersToValidateIntermedaire.length === 0) {
      alert('Veuillez sélectionner au moins un panier à valider.');
      return;
    }
   
    this.panierService.sendData(paniersToValidateIntermedaire);
    console.log('Paniers à valider :', paniersToValidateIntermedaire);
     sessionStorage.setItem('produitSelected', JSON.stringify(paniersToValidateIntermedaire));
    this.router.navigate(['/home/panier/validation']);

  }

    getStockById(id: string | ''): void {
    this.stockService.getStockById(id).subscribe({
      next: (data) => {
        this.max_stock.set(data[0].stockRestant || 0);
      },
      error: (err) => console.error('Error loading stock', err)
    });
 
  }
  }
