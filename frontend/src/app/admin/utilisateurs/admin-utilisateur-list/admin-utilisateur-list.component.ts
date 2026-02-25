import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../services/admin.service';

@Component({
    selector: 'app-admin-utilisateur-list',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './admin-utilisateur-list.component.html',
})
export class AdminUtilisateurListComponent implements OnInit {
    private adminService = inject(AdminService);

    utilisateurs = signal<any[]>([]);
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
        this.adminService.getAcheteurs().subscribe({
            next: (data) => {
                this.utilisateurs.set(data);
                this.loading.set(false);
            },
            error: (err) => {
                this.error.set(err.error?.error || 'Erreur lors du chargement des utilisateurs');
                this.loading.set(false);
            }
        });
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
