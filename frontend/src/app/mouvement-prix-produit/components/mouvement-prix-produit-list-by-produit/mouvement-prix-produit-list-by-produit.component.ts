import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';import { Router, RouterModule,ActivatedRoute } from '@angular/router';
import { MouvementPrixProduitService } from '../../services/mouvement-prix-produit.services';
import { MouvementPrixProduitByProduit } from '../../models/mouvement-prix-produit.models';
import { AuthService } from '../../../auth/services/auth.service';
import { User } from '../../../auth/models/auth.models';

@Component({
  selector: 'app-mouvement-prix-produit-list-by-produit',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './mouvement-prix-produit-list-by-produit.component.html'
})
export class MouvementPrixProduitListByProduitComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private mouvementPrixProduitService = inject(MouvementPrixProduitService);
  private authService = inject(AuthService);
  mouvementsPrixProduits = signal<MouvementPrixProduitByProduit[]>([]);
  user : User | null = null;

  ngOnInit() {
    this.user = this.authService.currentUser();
    this.loadMouvementsPrixProduits(this.user?.boutique || '');
  }

  loadMouvementsPrixProduits(boutique: string) {
    this.mouvementPrixProduitService.getPrixActuelByProduit(boutique).subscribe({
      next: (data) => this.mouvementsPrixProduits.set(data),
      error: (err) => console.error('Error loading mouvements prix produits', err)
    });
  }





}
