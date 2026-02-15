import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';import { Router, RouterModule,ActivatedRoute } from '@angular/router';
import { MouvementPrixProduitService } from '../../services/mouvement-prix-produit.services';
import { MouvementPrixProduit } from '../../models/mouvement-prix-produit.models';
import { Produit, SousTypeProduit } from '../../../produit/models/produit.models';

@Component({
  selector: 'app-mouvement-prix-produit-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './mouvement-prix-produit-list.component.html'
})
export class MouvementPrixProduitListComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private mouvementPrixProduitService = inject(MouvementPrixProduitService);
  mouvementsPrixProduits = signal<MouvementPrixProduit[]>([]);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.loadMouvementsPrixProduits(id || '');
  }

  loadMouvementsPrixProduits(id: string) {
    this.mouvementPrixProduitService.getMouvementsPrixByProduit(id).subscribe({
      next: (data) => this.mouvementsPrixProduits.set(data),
      error: (err) => console.error('Error loading mouvements prix produits', err)
    });
  }





}
