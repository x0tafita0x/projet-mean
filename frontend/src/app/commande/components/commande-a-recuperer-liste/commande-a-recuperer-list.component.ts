import { Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommandeService } from '../../services/commande.services';
import { Commande, CommandeDetails } from '../../models/commande.models';
import { AuthService } from '../../../auth/services/auth.service';
import { User } from '../../../auth/models/auth.models';
import { FactureTicketComponent } from '../../../facture-ticket/facture-ticket.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { FilterCriteria } from '../../../shared/models/pagination.models';
import { EtatService } from '../../../shared/service/etat.service';
import { ETATS } from '../../../shared/constants/etat.constants';

@Component({
  selector: 'app-commande-a-recuperer-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, FactureTicketComponent, PaginationComponent],
  templateUrl: './commande-a-recuperer-list.component.html',
  styleUrl: './commande-a-recuperer-list.component.css'
})
export class CommandeARecupererListComponent implements OnInit {
  private commandeService = inject(CommandeService);
  private authService = inject(AuthService);
  private etatService = inject(EtatService);

  commandeSelectionnee = signal<CommandeDetails[]>([]);
  commandes = signal<Commande[]>([]);
  totalItems = signal(0);
  currentPage = signal(1);
  pageSize = signal(10);

  filters = signal<FilterCriteria>({
    startDate: '',
    endDate: ''
  });

  user: User | null = null;
  data = signal({
    dateFacture: '',
    idFFacture: '',
    client: '',
    boutique: ''
  });
  @ViewChild('facture') factureComponent!: any;

  ngOnInit() {
    this.user = this.authService.currentUser();
    this.loadCommandes();
  }

  async loadCommandes() {
    const criteria: FilterCriteria = {
      ...this.filters(),
      page: this.currentPage(),
      limit: this.pageSize()
    };

    const etatId = await this.etatService.getEtatIdByNom(ETATS.A_RECUPERER);
    if (!etatId) {
      console.error(`Etat "${ETATS.A_RECUPERER}" non trouvé`);
      return;
    }

    this.commandeService.getCommandes(this.user?.boutique || "", etatId, criteria).subscribe({
      next: (response) => {
        this.commandes.set(response.data);
        this.totalItems.set(response.total);
      },
      error: (err) => console.error('Error loading commandes', err)
    });
  }

  applyFilters() {
    this.currentPage.set(1);
    this.loadCommandes();
  }

  resetFilters() {
    this.filters.set({
      startDate: '',
      endDate: ''
    });
    this.applyFilters();
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadCommandes();
  }


  ouvrirDetails(commande: any) {
    this.commandeService.getCommandeDetails(commande._id, this.user?.boutique || "").subscribe({
      next: (data) => {
        this.commandeSelectionnee.set(data);
        this.data.set({
          dateFacture: new Date(commande.createdAt).toLocaleString(),
          idFFacture: commande._id,
          client: commande.client,
          boutique: this.commandeSelectionnee().length > 0 ? this.commandeSelectionnee()[0].panier.produit.boutique.nom : ''
        });
      },
      error: (err) => console.error('Error loading commande details', err)
    });
  }

  fermerDetails() {
    this.commandeSelectionnee.set([]);
  }


  validerProduits() {
    const achatId = this.commandeSelectionnee().length > 0 ? this.commandeSelectionnee()[0].achat : '';

    this.commandeService.updateCommandeToPayeEtRecupere(achatId).subscribe({
      next: () => {
        alert('Commande mise à jour avec succès !');

        setTimeout(() => {
          if (this.factureComponent) {
            this.factureComponent.exportPDF();
          } else {
            console.error('FactureComponent pas encore prêt');
          }

          this.fermerDetails();
          this.loadCommandes();
        }, 50);
      },
      error: (err) => alert('Erreur lors de la mise à jour de la commande')
    });
  }

  annulerCommande() {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) return;

    const achatId = this.commandeSelectionnee().length > 0 ? this.commandeSelectionnee()[0].achat : '';

    this.commandeService.cancelCommande(achatId).subscribe({
      next: () => {
        alert('Commande annulée avec succès !');
        this.fermerDetails();
        this.loadCommandes();
      },
      error: (err) => alert('Erreur lors de l\'annulation de la commande')
    });
  }



}
