import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';import { Router, RouterModule,ActivatedRoute } from '@angular/router';
import { MouvementPrixProduitService } from '../../services/mouvement-prix-produit.services';
import { MouvementPrixProduit } from '../../models/mouvement-prix-produit.models';
import { User } from '../../../auth/models/auth.models';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-mouvement-prix-produit-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './mouvement-prix-produit-list.component.html'
})
export class MouvementPrixProduitListComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private mouvementPrixProduitService = inject(MouvementPrixProduitService);
  private authService = inject(AuthService);
  mouvementsPrixProduits = signal<MouvementPrixProduit[]>([]);
  user : User | null = null;

  ngOnInit() {
    this.user = this.authService.currentUser();
    this.loadMouvementsPrixProduits(this.user?.boutique || '');
  }

  loadMouvementsPrixProduits(boutique: string) {
    this.mouvementPrixProduitService.getMouvementsPrixByProduit(boutique).subscribe({
      next: (data) => this.mouvementsPrixProduits.set(data),
      error: (err) => console.error('Error loading mouvements prix produits', err)
    });
  }





}
