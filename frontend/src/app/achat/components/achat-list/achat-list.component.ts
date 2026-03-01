import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AchatService } from '../../services/achat.services';
import { Achat } from '../../models/achat.models';
import { AuthService } from '../../../auth/services/auth.service';
import { User } from '../../../auth/models/auth.models';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { FilterCriteria } from '../../../shared/models/pagination.models';

@Component({
  selector: 'app-achat-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PaginationComponent],
  templateUrl: './achat-list.component.html',
  styleUrl: './achat-list.component.css'
})
export class AchatListComponent implements OnInit {
  private achatService = inject(AchatService);
  private authService = inject(AuthService);
  private router = inject(Router);


  achats = signal<Achat[]>([]);
  totalItems = signal(0);
  currentPage = signal(1);
  pageSize = signal(10);
  user: User | null = null;

  filters = signal<FilterCriteria>({
    startDate: '',
    endDate: ''
  });


  ngOnInit() {
    this.user = this.authService.currentUser();
    this.loadAchats();
  }

  loadAchats() {
    const criteria: FilterCriteria = {
      ...this.filters(),
      page: this.currentPage(),
      limit: this.pageSize()
    };

    this.achatService.getAchatsByUtilisateur(this.user?.id || null, criteria).subscribe({
      next: (response) => {
        this.achats.set(response.data);
        this.totalItems.set(response.total);
      },
      error: (err) => console.error('Error loading achats', err)
    });
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadAchats();
  }

  updateFilters(key: 'startDate' | 'endDate', value: string) {
    this.filters.update(prev => ({ ...prev, [key]: value }));
  }

  applyFilters() {
    this.currentPage.set(1);
    this.loadAchats();
  }

  resetFilters() {
    this.filters.set({ startDate: '', endDate: '' });
    this.currentPage.set(1);
    this.loadAchats();
  }


}
