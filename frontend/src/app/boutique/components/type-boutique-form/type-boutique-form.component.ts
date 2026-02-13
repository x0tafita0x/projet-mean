import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BoutiqueService } from '../../services/boutique.services';
import { TypeBoutique } from '../../models/boutique.models';

@Component({
  selector: 'app-type-boutique-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './type-boutique-form.component.html'
})
export class TypeBoutiqueFormComponent implements OnInit {
  private boutiqueService = inject(BoutiqueService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  typeBoutique = signal<TypeBoutique>({ nom: '' });
  isEdit = signal(false);
  loading = signal(false);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.boutiqueService.getTypeBoutiqueById(id).subscribe({
        next: (data) => this.typeBoutique.set(data),
        error: (err) => alert('Erreur lors du chargement du type')
      });
    }
  }

  save() {
    this.loading.set(true);
    const obs = this.isEdit()
      ? this.boutiqueService.updateTypeBoutique(this.typeBoutique()._id!, this.typeBoutique())
      : this.boutiqueService.createTypeBoutique(this.typeBoutique());

    obs.subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/home/type-boutique']);
      },
      error: (err) => {
        this.loading.set(false);
        alert('Erreur lors de l\'enregistrement');
      }
    });
  }
}
