import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProduitService } from '../../services/produit.services';
import { Produit, TypeProduit, SousTypeProduit } from '../../models/produit.models';
import { MouvementPrixProduitService } from '../../../mouvement-prix-produit/services/mouvement-prix-produit.services';
import { User } from '../../../auth/models/auth.models';
import { AuthService } from '../../../auth/services/auth.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { FilterCriteria } from '../../../shared/models/pagination.models';


@Component({
  selector: 'app-produit-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, PaginationComponent],
  templateUrl: './produit-list.component.html'
})
export class ProduitListComponent implements OnInit {
  private produitService = inject(ProduitService);
  produits = signal<Produit[]>([]);
  totalItems = signal(0);
  currentPage = signal(1);
  pageSize = signal(10);

  filters = signal<FilterCriteria>({
    nom: '',
    typeProduit: '',
    sousTypeProduit: '',
    startDate: '',
    endDate: '',
    order: 'asc'
  });

  typeProduits = signal<TypeProduit[]>([]);
  sousTypeProduits = signal<SousTypeProduit[]>([]);

  private authService = inject(AuthService);

  user: User | null = null;

  ngOnInit() {
    this.user = this.authService.currentUser();
    this.loadProduits();
    this.loadTypes();
  }

  loadTypes() {
    this.produitService.getTypeProduits({ limit: 100 }).subscribe(res => this.typeProduits.set(res.data));
    this.produitService.getSousTypeProduits({ limit: 100 }).subscribe(res => this.sousTypeProduits.set(res.data));
  }

  updateFilters(key: string, value: any) {
    this.filters.update(prev => ({ ...prev, [key]: value }));
  }

  resetFilters() {
    this.filters.set({
      nom: '',
      typeProduit: '',
      sousTypeProduit: '',
      startDate: '',
      endDate: '',
      order: 'asc'
    });
    this.applyFilters();
  }

  loadProduits() {
    const criteria: FilterCriteria = {
      ...this.filters(),
      boutique: this.user?.boutique || '',
      page: this.currentPage(),
      limit: this.pageSize()
    };

    this.produitService.getProduits(criteria).subscribe({
      next: (response) => {
        this.produits.set(response.data);
        this.totalItems.set(response.total);
      },
      error: (err) => console.error('Error loading products', err)
    });
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadProduits();
  }

  applyFilters() {
    this.currentPage.set(1);
    this.loadProduits();
  }

  deleteProduit(id: string) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      this.produitService.deleteProduit(id).subscribe({
        next: () => this.loadProduits(),
        error: (err) => alert('Erreur lors de la suppression')
      });
    }
  }

  getSousTypeName(stype: string | SousTypeProduit): string {
    if (typeof stype === 'object' && stype !== null) {
      return stype.nom;
    }
    return 'N/A';
  }

  getBoutiqueName(boutique: any): string {
    if (typeof boutique === 'object' && boutique !== null) {
      return boutique.nom;
    }
    return boutique || 'N/A';
  }
}
