import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PanierService } from '../../services/panier.services';
import { Etat } from '../../models/panier.models';

@Component({
  selector: 'app-etat-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './etat-form.component.html'
})
export class EtatFormComponent implements OnInit {
  private panierService = inject(PanierService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  etat = signal<Etat>({ nom: '' });
  isEdit = signal(false);
  loading = signal(false);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.panierService.getEtatById(id).subscribe({
        next: (data) => this.etat.set(data),
        error: (err) => alert('Erreur lors du chargement de l\'état')
      });
    }
  }

  save() {
    this.loading.set(true);
    const obs = this.isEdit()
      ? this.panierService.updateEtat(this.etat()._id!, this.etat())
      : this.panierService.createEtat(this.etat());

    obs.subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/home/etat']);
      },
      error: (err) => {
        this.loading.set(false);
        alert('Erreur lors de l\'enregistrement');
      }
    });
  }
}
