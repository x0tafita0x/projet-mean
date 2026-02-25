import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProduitService } from '../../services/produit.services';
import { TypeProduit } from '../../models/produit.models';

@Component({
  selector: 'app-type-produit-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './type-produit-form.component.html'
})
export class TypeProduitFormComponent implements OnInit {
  private produitService = inject(ProduitService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  typeProduit = signal<TypeProduit>({ nom: '' });
  isEdit = signal(false);
  loading = signal(false);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.produitService.getTypeProduitById(id).subscribe({
        next: (data) => this.typeProduit.set(data),
        error: (err) => alert('Erreur lors du chargement du type')
      });
    }
  }

  save() {
    this.loading.set(true);
    const obs = this.isEdit()
      ? this.produitService.updateTypeProduit(this.typeProduit()._id!, this.typeProduit())
      : this.produitService.createTypeProduit(this.typeProduit());

    obs.subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/home/type-produit']);
      },
      error: (err) => {
        this.loading.set(false);
        alert('Erreur lors de l\'enregistrement');
      }
    });
  }
}
