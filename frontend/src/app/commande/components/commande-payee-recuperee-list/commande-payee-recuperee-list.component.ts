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

@Component({
  selector: 'app-commande-payee-recuperee-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, FactureTicketComponent, PaginationComponent],
  templateUrl: './commande-payee-recuperee-list.component.html',
  styleUrl: './commande-payee-recuperee-list.component.css'
})
export class CommandePayeeRecupereeListComponent implements OnInit {
  private commandeService = inject(CommandeService);
  private authService = inject(AuthService);
  private router = inject(Router);

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
    boutique: '',
    numeroTelephone: ''
  });
  @ViewChild('facture') factureComponent!: any;

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
    this.commandeService.getCommandes(this.user?.boutique || "", "6997d98f319cef48fa23a818", criteria).subscribe({
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
          boutique: this.commandeSelectionnee().length > 0 ? this.commandeSelectionnee()[0].panier.produit.boutique.nom : '',
          numeroTelephone: this.commandeSelectionnee().length > 0 ? this.commandeSelectionnee()[0].panier.produit.boutique.numeroTelephone : ''
        });
        console.log('Data pour la facture:', this.data());
      },
      error: (err) => console.error('Error loading commande details', err)
    });
  }

  fermerDetails() {
    this.commandeSelectionnee.set([]);
  }

  exportFacture() {

    // Attendre que le child soit rendu
    setTimeout(() => {
      if (this.factureComponent) {
        this.factureComponent.exportPDF();
      } else {
        console.error('FactureComponent pas encore chargé');
      }
    }, 300); // 300ms pour être sûr
  }






}
