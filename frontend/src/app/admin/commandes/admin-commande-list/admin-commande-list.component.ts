import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../services/admin.service';

@Component({
    selector: 'app-admin-commande-list',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './admin-commande-list.component.html',
})
export class AdminCommandeListComponent implements OnInit {
    private adminService = inject(AdminService);

    commandes = signal<any[]>([]);
    loading = signal<boolean>(false);
    error = signal<string>('');

    ngOnInit() {
        this.loadCommandes();
    }

    loadCommandes() {
        this.loading.set(true);
        this.error.set('');
        this.adminService.getCommandes().subscribe({
            next: (data) => {
                this.commandes.set(data);
                this.loading.set(false);
            },
            error: (err) => {
                this.error.set(err.error?.error || 'Erreur lors du chargement des commandes');
                this.loading.set(false);
            }
        });
    }
}
