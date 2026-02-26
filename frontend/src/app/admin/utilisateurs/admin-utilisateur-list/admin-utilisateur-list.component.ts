import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { FilterCriteria } from '../../../shared/models/pagination.models';

@Component({
    selector: 'app-admin-utilisateur-list',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule, PaginationComponent],
    templateUrl: './admin-utilisateur-list.component.html',
})
export class AdminUtilisateurListComponent implements OnInit {
    private adminService = inject(AdminService);

    utilisateurs = signal<any[]>([]);
    totalItems = signal(0);
    currentPage = signal(1);
    pageSize = signal(10);

    filters = signal<FilterCriteria>({
        search: ''
    });

    loading = signal<boolean>(false);
    error = signal<string>('');
    historique = signal<any>(null);
    historiquePour = signal<string>('');

    ngOnInit() {
        this.loadUsers();
    }

    loadUsers() {
        this.loading.set(true);
        this.error.set('');

        const criteria: FilterCriteria = {
            ...this.filters(),
            page: this.currentPage(),
            limit: this.pageSize()
        };

        this.adminService.getAcheteurs(criteria).subscribe({
            next: (response) => {
                this.utilisateurs.set(response.data);
                this.totalItems.set(response.total);
                this.loading.set(false);
            },
            error: (err) => {
                this.error.set(err.error?.error || 'Erreur lors du chargement des utilisateurs');
                this.loading.set(false);
            }
        });
    }

    onPageChange(page: number) {
        this.currentPage.set(page);
        this.loadUsers();
    }

    applyFilters() {
        this.currentPage.set(1);
        this.loadUsers();
    }

    resetFilters() {
        this.filters.set({
            search: ''
        });
        this.applyFilters();
    }

    updateFilters(key: string, value: any) {
        this.filters.update(prev => ({ ...prev, [key]: value }));
    }

    toggleActive(id: string) {
        this.adminService.toggleUserActive(id).subscribe({
            next: () => this.loadUsers(),
            error: (err) => alert(err.error?.error || 'Erreur')
        });
    }

    deleteUser(id: string) {
        if (!confirm('Supprimer cet utilisateur ?')) return;
        this.adminService.deleteUser(id).subscribe({
            next: () => this.loadUsers(),
            error: (err) => alert(err.error?.error || 'Erreur')
        });
    }

    loadHistorique(id: string, nom: string) {
        this.historiquePour.set(nom);
        this.adminService.getUserOrderHistory(id).subscribe({
            next: (data) => {
                this.historique.set(data);
            },
            error: (err) => alert(err.error?.error || 'Erreur')
        });
    }

    closeHistorique() {
        this.historique.set(null);
        this.historiquePour.set('');
    }
}
