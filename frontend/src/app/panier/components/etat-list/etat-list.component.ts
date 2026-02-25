import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PanierService } from '../../services/panier.services';
import { Etat } from '../../models/panier.models';

@Component({
  selector: 'app-etat-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './etat-list.component.html'
})
export class EtatListComponent implements OnInit {
  private panierService = inject(PanierService);
  etats = signal<Etat[]>([]);

  ngOnInit() {
    this.loadEtats();
  }

  loadEtats() {
    this.panierService.getEtats().subscribe({
      next: (data) => this.etats.set(data),
      error: (err) => console.error('Error loading etats', err)
    });
  }

  deleteEtat(id: string) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet état ?')) {
      this.panierService.deleteEtat(id).subscribe({
        next: () => this.loadEtats(),
        error: (err) => alert('Erreur lors de la suppression')
      });
    }
  }
}
