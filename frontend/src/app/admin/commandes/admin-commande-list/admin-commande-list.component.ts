import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { FilterCriteria } from '../../../shared/models/pagination.models';

@Component({
    selector: 'app-admin-commande-list',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule, PaginationComponent],
    templateUrl: './admin-commande-list.component.html',
})
export class AdminCommandeListComponent implements OnInit {
    private adminService = inject(AdminService);

    commandes = signal<any[]>([]);
    totalItems = signal(0);
    currentPage = signal(1);
    pageSize = signal(10);

    filters = signal<FilterCriteria>({
        clientId: '',
        boutiqueId: '',
        startDate: '',
        endDate: ''
    });

    loading = signal<boolean>(false);
    error = signal<string>('');

    ngOnInit() {
        this.loadCommandes();
    }

    resetFilters() {
        this.filters.set({
            clientId: '',
            boutiqueId: '',
            startDate: '',
            endDate: ''
        });
        this.applyFilters();
    }

    updateFilters(key: string, value: any) {
        this.filters.update(prev => ({ ...prev, [key]: value }));
    }

    loadCommandes() {
        this.loading.set(true);
        this.error.set('');

        const criteria: FilterCriteria = {
            ...this.filters(),
            page: this.currentPage(),
            limit: this.pageSize()
        };

        this.adminService.getCommandes(criteria).subscribe({
            next: (response) => {
                this.commandes.set(response.data);
                this.totalItems.set(response.total);
                this.loading.set(false);
            },
            error: (err) => {
                this.error.set(err.error?.error || 'Erreur lors du chargement des commandes');
                this.loading.set(false);
            }
        });
    }

    onPageChange(page: number) {
        this.currentPage.set(page);
        this.loadCommandes();
    }

    applyFilters() {
        this.currentPage.set(1);
        this.loadCommandes();
    }
}
