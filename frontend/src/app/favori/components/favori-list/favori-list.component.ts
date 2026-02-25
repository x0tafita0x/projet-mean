import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';import { Router, RouterModule,ActivatedRoute } from '@angular/router';
import { FavoriService } from '../../services/favori.services';
import { FavoriList } from '../../models/favori.models';
import { AuthService } from '../../../auth/services/auth.service';
import { User } from '../../../auth/models/auth.models';

@Component({
  selector: 'app-favori-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './favori-list.component.html'
})
export class FavoriListComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private favoriService = inject(FavoriService);
    private authService = inject(AuthService);
  favoris = signal<FavoriList[]>([]);
    user : User | null = null;

  ngOnInit() {
    this.user = this.authService.currentUser();
    this.loadFavoris(this.user?.id || '');
  }

  loadFavoris(id: string) {
    this.favoriService.getListeFavoris(id).subscribe({
      next: (data) => this.favoris.set(data),
      error: (err) => console.error('Error loading favoris', err)
    });
  }
  deleteFavori(id: string) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce favori ?')) {
      this.favoriService.deleteFavori(id).subscribe({
        next: () => {
          alert('Favori supprimé avec succès');
          this.loadFavoris(this.user?.id || '');
        },
        error: (err) => {
          console.error('Error deleting favori', err);
          alert('Erreur lors de la suppression du favori');
        }
      });
    }
  }





}
