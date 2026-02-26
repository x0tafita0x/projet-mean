import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { FilterCriteria } from '../../../shared/models/pagination.models';

@Component({
    selector: 'app-admin-boutique-list',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule, PaginationComponent],
    templateUrl: './admin-boutique-list.component.html',
})
export class AdminBoutiqueListComponent implements OnInit {
    private adminService = inject(AdminService);

    boutiques = signal<any[]>([]);
    totalItems = signal(0);
    currentPage = signal(1);
    pageSize = signal(10);

    filters = signal<FilterCriteria>({
        search: '',
        status: ''
    });

    loading = signal<boolean>(false);
    error = signal<string>('');

    ngOnInit() {
        this.loadBoutiques();
    }

    loadBoutiques() {
        this.loading.set(true);
        this.error.set('');

        const criteria: FilterCriteria = {
            ...this.filters(),
            page: this.currentPage(),
            limit: this.pageSize()
        };

        this.adminService.getBoutiques(criteria).subscribe({
            next: (response) => {
                this.boutiques.set(response.data);
                this.totalItems.set(response.total);
                this.loading.set(false);
            },
            error: (err) => {
                this.error.set(err.error?.error || 'Erreur lors du chargement des boutiques');
                this.loading.set(false);
            }
        });
    }

    onPageChange(page: number) {
        this.currentPage.set(page);
        this.loadBoutiques();
    }

    applyFilters() {
        this.currentPage.set(1);
        this.loadBoutiques();
    }

    resetFilters() {
        this.filters.set({
            search: '',
            status: ''
        });
        this.applyFilters();
    }

    updateFilters(key: string, value: any) {
        this.filters.update(prev => ({ ...prev, [key]: value }));
    }

    setStatus(id: string, status: string) {
        this.adminService.setBoutiqueStatus(id, status).subscribe({
            next: () => this.loadBoutiques(),
            error: (err) => alert(err.error?.error || 'Erreur')
        });
    }

    delete(id: string) {
        if (!confirm('Supprimer cette boutique ?')) return;
        this.adminService.deleteBoutique(id).subscribe({
            next: () => this.loadBoutiques(),
            error: (err) => alert(err.error?.error || 'Erreur')
        });
    }

    statusBadge(status: string): string {
        const map: Record<string, string> = {
            active: 'bg-success',
            inactive: 'bg-secondary',
            suspendue: 'bg-warning text-dark',
        };
        return map[status] || 'bg-secondary';
    }
}
