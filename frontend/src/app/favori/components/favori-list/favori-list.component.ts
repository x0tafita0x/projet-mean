import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common'; import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FavoriService } from '../../services/favori.services';
import { FavoriList } from '../../models/favori.models';
import { AuthService } from '../../../auth/services/auth.service';
import { User } from '../../../auth/models/auth.models';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { FilterCriteria } from '../../../shared/models/pagination.models';
import { PhotoUrlPipe } from '../../../shared/pipes/photo-url.pipe';

@Component({
  selector: 'app-favori-list',
  standalone: true,
  imports: [CommonModule, RouterModule, PaginationComponent, PhotoUrlPipe],
  templateUrl: './favori-list.component.html'
})
export class FavoriListComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private favoriService = inject(FavoriService);
  private authService = inject(AuthService);

  favoris = signal<FavoriList[]>([]);
  totalItems = signal(0);
  currentPage = signal(1);
  pageSize = signal(10);
  user: User | null = null;

  ngOnInit() {
    this.user = this.authService.currentUser();
    this.loadFavoris();
  }

  loadFavoris() {
    const criteria: FilterCriteria = {
      clientId: this.user?.id || '',
      page: this.currentPage(),
      limit: this.pageSize()
    };

    this.favoriService.getListeFavoris(criteria).subscribe({
      next: (response) => {
        this.favoris.set(response.data);
        this.totalItems.set(response.total);
      },
      error: (err) => console.error('Error loading favoris', err)
    });
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadFavoris();
  }
  deleteFavori(id: string) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce favori ?')) {
      this.favoriService.deleteFavori(id).subscribe({
        next: () => {
          alert('Favori supprimé avec succès');
          this.loadFavoris();
        },
        error: (err) => {
          console.error('Error deleting favori', err);
          alert('Erreur lors de la suppression du favori');
        }
      });
    }
  }





}
