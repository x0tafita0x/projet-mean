import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProduitService } from '../../services/produit.services';
import { Produit, ProduitDetail, SousTypeProduit } from '../../../produit/models/produit.models';
import { StockResponse } from '../../../stock/models/stock.models';
import { StockService } from '../../../stock/services/stock.services';
import { PanierService } from '../../../panier/services/panier.services';
import { BoutiqueService } from '../../../boutique/services/boutique.services';
import { AuthService } from '../../../auth/services/auth.service';
import { User } from '../../../auth/models/auth.models';
import { FavoriService } from '../../../favori/services/favori.services';
import { FilterCriteria } from '../../../shared/models/pagination.models';

@Component({
  selector: 'produit-list-acheteur',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './produit-list-acheteur.component.html',
  styleUrl: './produit-list-acheteur.component.css'
})
export class ProduitListAcheteurComponent {

  private produitService = inject(ProduitService);
  private stockService = inject(StockService);
  private panierService = inject(PanierService);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private favoriService = inject(FavoriService);
  private boutiqueService = inject(BoutiqueService);

  user: User | null = null;
  filters = signal<FilterCriteria>({
    nom: '',
    sousTypeProduit: '',
    order: 'asc'
  });
  produitSelectionne = signal<ProduitDetail>({ _id: '', nom: '', sousTypeProduit: { _id: '', nom: '', typeProduit: { _id: '', nom: '' } }, boutique: { _id: '', nom: '' } });
  panierItem = signal({ utilisateur: '', produit: '', prix: 0, quantite: 1, etat: 'en cours', typeCommande: 'normal' });
  showDetails = signal(false);
  produits = signal<StockResponse[]>([]);
  sousTypeProduits = signal<SousTypeProduit[]>([]);
  prixProduit = signal<string>('0');
  max_stock = signal<number>(0);
  favori = signal<boolean>(false);
  boutique : {
    _id: string;
    nom: string;
  } = { _id: '', nom: '' };

  typeBoutique: string = '';
  order: string = 'asc';

  ngOnInit() {
    this.user = this.authService.currentUser();
    const id = this.route.snapshot.paramMap.get('id');
    this.loadProduits(id);
    this.loadBoutiqueDetails(id || '');
    this.loadSousTypeProduits();
    this.isFavori(id || '');
  }

  applyFilters() {
    const id = this.route.snapshot.paramMap.get('id');
    this.loadProduits(id);
  }

  resetFilters() {
    this.filters.set({
      nom: '',
      sousTypeProduit: '',
      order: 'asc'
    });
    this.applyFilters();
  }

  updateFilters(key: string, value: any) {
    this.filters.update(prev => ({ ...prev, [key]: value }));
  }

  loadBoutiqueDetails(id: string | '') {
    this.boutiqueService.getBoutiqueById(id).subscribe({
      next: (data) => {
        this.boutique._id = data._id || '';
        this.boutique.nom = data.nom || '';
      },
      error: (err) => console.error(err)
    });
  }

  loadProduits(id: string | null) {
    const criteria: FilterCriteria = {
      ...this.filters(),
      boutiqueId: id || '',
      limit: 100
    };
    this.stockService.getProduits(criteria).subscribe({
      next: (response) => this.produits.set(response.data),
      error: (err) => console.error('Error loading produits', err)
    });
  }
  loadSousTypeProduits() {
    this.produitService.getSousTypeProduits({ limit: 1000 }).subscribe({
      next: (response) => this.sousTypeProduits.set(response.data),
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
    this.getStockById(produit._id as string || '');
  }

  fermerDetails() {
    this.showDetails.set(false);
    this.produitSelectionne.set({ _id: '', nom: '', sousTypeProduit: { _id: '', nom: '', typeProduit: { _id: '', nom: '' } }, boutique: { _id: '', nom: '' } });
  }

  putData(produit: StockResponse, prix: string) {
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
    if (this.panierItem().quantite > this.max_stock()) {
      alert(`Quantité demandée dépasse le stock disponible (${this.max_stock()}).`);
      return;
    } else if (this.panierItem().quantite < 1) {
      alert(`Quantité doit être au moins 1.`);
      return;
    }
    const item = this.panierItem();
    this.panierService.createPanier(item).subscribe({
      next: (data) => alert('Produit ajouté au panier avec succès !'),
      error: (err) => console.error('Error creating panier:', err)
    });
  }

  getStockById(id: string | ''): void {
    this.stockService.getStockById(id).subscribe({
      next: (data) => {
        this.max_stock.set(data[0].stockRestant || 0);
      },
      error: (err) => console.error('Error loading stock', err)
    });

  }

  toggleFavori(boutique: string, event: Event) {
    event.stopPropagation(); // évite le clic sur la carte
    if (this.favori()) {
      this.favoriService.deleteFavori(boutique).subscribe({
        next: () => {
          this.favori.set(false);
          alert('Produit retiré des favoris');
        },
        error: (err) => {
          console.error('Error removing favori', err);
          alert('Erreur lors de la suppression du favori');
        }
      });
    } else {
      this.favoriService.createFavori({
        utilisateur: this.user?.id || '',
        boutique: boutique
      }).subscribe({
        next: () => {
          this.favori.set(true);
          alert('Produit ajouté aux favoris');
        },
        error: (err) => {
          console.error('Error adding favori', err);
          alert('Erreur lors de l\'ajout du favori');
        }
      });
    }
  }
  isFavori(boutiqueId: string): void {
    console.log('Checking if boutique is favori for user', boutiqueId, this.user?.id);
    this.favoriService.isFavoriExist(boutiqueId, this.user?.id || '').subscribe({
      next: (data) => {
        this.favori.set(data);
      },
      error: (err) => console.error('Error checking favori', err)
    });
  }
}
