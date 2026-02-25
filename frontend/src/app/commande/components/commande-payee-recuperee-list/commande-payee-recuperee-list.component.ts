import { Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule,Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommandeService } from '../../services/commande.services';
import {  Commande,CommandeDetails } from '../../models/commande.models';
import { AuthService } from '../../../auth/services/auth.service';
import { User } from '../../../auth/models/auth.models';
import { FactureTicketComponent } from '../../../facture-ticket/facture-ticket.component';

@Component({
  selector: 'app-commande-payee-recuperee-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, FactureTicketComponent],
  templateUrl: './commande-payee-recuperee-list.component.html',
  styleUrl: './commande-payee-recuperee-list.component.css'
})
export class CommandePayeeRecupereeListComponent implements OnInit {
  private commandeService = inject(CommandeService);
     private authService = inject(AuthService);
     private router = inject(Router);

  commandeSelectionnee=signal<CommandeDetails []>([]);
  commandes = signal<Commande[]>([]);
    user : User | null = null;
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

  loadCommandes() {
    this.commandeService.getCommandes(this.user?.boutique || "","6997d98f319cef48fa23a818").subscribe({
      next: (data) => this.commandes.set(data),
      error: (err) => console.error('Error loading commandes', err)
    });
  }


ouvrirDetails(commande: any) {
  this.commandeService.getCommandeDetails(commande._id, this.user?.boutique || "").subscribe({
    next: (data) =>{ this.commandeSelectionnee.set(data);
      this.data.set({
        dateFacture: new Date(commande.createdAt).toLocaleString(),
        idFFacture: commande._id,
        client: commande.client,
        boutique: this.commandeSelectionnee().length > 0 ? this.commandeSelectionnee()[0].panier.produit.boutique.nom : ''
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
