import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommandeService } from '../../services/commande.services';
import { Commande, CommandeDetails } from '../../models/commande.models';
import { AuthService } from '../../../auth/services/auth.service';
import { User } from '../../../auth/models/auth.models';
import { map } from 'rxjs';

import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { FilterCriteria } from '../../../shared/models/pagination.models';

@Component({
  selector: 'app-commande-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PaginationComponent],
  templateUrl: './commande-list.component.html',
  styleUrl: './commande-list.component.css'
})
export class CommandeListComponent implements OnInit {
  private commandeService = inject(CommandeService);
  private authService = inject(AuthService);
  private router = inject(Router);

  commandeSelectionnee = signal<CommandeDetails[]>([]);
  commandes = signal<Commande[]>([]);
  isValid = signal(false);
  user: User | null = null;
  produitsSelectionnes: CommandeDetails[] = [];

  totalItems = signal(0);
  currentPage = signal(1);
  pageSize = signal(10);

  filters = signal<FilterCriteria>({
    startDate: '',
    endDate: ''
  });


  ngOnInit() {
    this.user = this.authService.currentUser();
    this.loadCommandes();
  }

  loadCommandes() {
    const criteria: FilterCriteria = {
      ...this.filters(),
      page: this.currentPage(),
      limit: this.pageSize()
    };
    this.commandeService.getCommandes(this.user?.boutique || "", "6997d956319cef48fa23a812", criteria).subscribe({
      next: (response) => {
        this.commandes.set(response.data);
        this.totalItems.set(response.total);
      },
      error: (err) => console.error('Error loading commandes', err)
    });
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadCommandes();
  }

  applyFilters() {
    this.currentPage.set(1);
    this.loadCommandes();
  }

  resetFilters() {
    this.filters.set({ startDate: '', endDate: '' });
    this.currentPage.set(1);
    this.loadCommandes();
  }


  ouvrirDetails(commande: any) {
    this.commandeService.getCommandeDetails(commande._id, this.user?.boutique || "").subscribe({
      next: (data) => { this.commandeSelectionnee.set(data); this.isValided(); },
      error: (err) => console.error('Error loading commande details', err)
    });
  }

  fermerDetails() {
    this.commandeSelectionnee.set([]);
  }

  toggleSelection(produit: any) {
    const index = this.produitsSelectionnes.findIndex(p => p._id === produit._id);
    if (index > -1) {
      this.produitsSelectionnes.splice(index, 1);
    } else {
      this.produitsSelectionnes.push(produit);
      this.isValided();
    }
  }

  estSelectionne(produit: any): boolean {
    return this.produitsSelectionnes.some(p => p._id === produit._id);
  }

  isValided() {
    const tousPresent = this.commandeSelectionnee().every(cmd =>
      this.produitsSelectionnes.some(prod => prod._id === cmd._id)
    );

    this.isValid.set(tousPresent);
  }

  validerProduits() {
    const achatId = this.commandeSelectionnee().length > 0 ? this.commandeSelectionnee()[0].achat : '';


    this.commandeService.updateCommandeToRecuperer(achatId).subscribe({
      next: () => {
        alert('Commande mise à jour avec succès !');
        this.loadCommandes();
        this.fermerDetails();
      },
      error: (err) => alert('Erreur lors de la mise à jour de la commande')
    });

    console.log('Produits sélectionnés pour cette commande :', this.produitsSelectionnes);
    // ici tu peux envoyer les produits sélectionnés au backend
    this.fermerDetails();
  }


}
