import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule,Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommandeService } from '../../services/commande.services';
import {  Commande } from '../../models/commande.models';
import { AuthService } from '../../../auth/services/auth.service';
import { User } from '../../../auth/models/auth.models';

@Component({
  selector: 'app-commande-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './commande-list.component.html',
  styleUrl: './commande-list.component.css'
})
export class CommandeListComponent implements OnInit {
  private commandeService = inject(CommandeService);
     private authService = inject(AuthService);
     private router = inject(Router);


  commandes = signal<Commande[]>([]);
    user : User | null = null;



  ngOnInit() {
      this.user = this.authService.currentUser();
    this.loadCommandes();
  }

  loadCommandes() {
    this.commandeService.getCommandes(this.user?.boutique || "").subscribe({
      next: (data) => this.commandes.set(data),
      error: (err) => console.error('Error loading commandes', err)
    });
  }

 



  }
