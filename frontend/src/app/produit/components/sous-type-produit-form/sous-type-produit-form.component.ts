import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProduitService } from '../../services/produit.services';
import { SousTypeProduit, TypeProduit } from '../../models/produit.models';

@Component({
  selector: 'app-sous-type-produit-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './sous-type-produit-form.component.html'
})
export class SousTypeProduitFormComponent implements OnInit {
  private produitService = inject(ProduitService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  sousTypeProduit = signal<SousTypeProduit>({ nom: '', typeProduit: '' });
  typeProduits = signal<TypeProduit[]>([]);
  isEdit = signal(false);
  loading = signal(false);

  ngOnInit() {
    this.loadTypes();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.produitService.getSousTypeProduitById(id).subscribe({
        next: (data) => {
          // Normalize typeProduit to ID if it's an object
          if (typeof data.typeProduit === 'object') {
            data.typeProduit = (data.typeProduit as TypeProduit)._id!;
          }
          this.sousTypeProduit.set(data);
        },
        error: (err) => alert('Erreur lors du chargement du sous-type')
      });
    }
  }

  loadTypes() {
    this.produitService.getTypeProduits({ limit: 1000 }).subscribe({
      next: (response) => this.typeProduits.set(response.data),
      error: (err) => console.error('Error loading types', err)
    });
  }

  save() {
    this.loading.set(true);
    const obs = this.isEdit()
      ? this.produitService.updateSousTypeProduit(this.sousTypeProduit()._id!, this.sousTypeProduit())
      : this.produitService.createSousTypeProduit(this.sousTypeProduit());

    obs.subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/home/sous-type-produit']);
      },
      error: (err) => {
        this.loading.set(false);
        alert('Erreur lors de l\'enregistrement');
      }
    });
  }
}
