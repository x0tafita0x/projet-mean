import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule,Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommandeService } from '../../services/commande.services';
import {  Commande,CommandeDetails } from '../../models/commande.models';
import { AuthService } from '../../../auth/services/auth.service';
import { User } from '../../../auth/models/auth.models';
import { map } from 'rxjs';

@Component({
  selector: 'app-commande-a-recuperer-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './commande-a-recuperer-list.component.html',
  styleUrl: './commande-a-recuperer-list.component.css'
})
export class CommandeARecupererListComponent implements OnInit {
  private commandeService = inject(CommandeService);
     private authService = inject(AuthService);
     private router = inject(Router);

  commandeSelectionnee=signal<CommandeDetails []>([]);
  commandes = signal<Commande[]>([]);
    user : User | null = null;





  ngOnInit() {
      this.user = this.authService.currentUser();
    this.loadCommandes();
  }

  loadCommandes() {
    this.commandeService.getCommandes(this.user?.boutique || "","6997d981319cef48fa23a815").subscribe({
      next: (data) => this.commandes.set(data),
      error: (err) => console.error('Error loading commandes', err)
    });
  }


ouvrirDetails(commande: any) {
  this.commandeService.getCommandeDetails(commande._id, this.user?.boutique || "").subscribe({
    next: (data) =>{ this.commandeSelectionnee.set(data); },
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
      this.loadCommandes();
      this.fermerDetails();
    },
    error: (err) => alert('Erreur lors de la mise à jour de la commande')
  });

  this.fermerDetails();
}


  }
