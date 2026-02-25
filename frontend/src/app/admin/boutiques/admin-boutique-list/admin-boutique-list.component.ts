import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../services/admin.service';

@Component({
    selector: 'app-admin-boutique-list',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './admin-boutique-list.component.html',
})
export class AdminBoutiqueListComponent implements OnInit {
    private adminService = inject(AdminService);

    boutiques = signal<any[]>([]);
    loading = signal<boolean>(false);
    error = signal<string>('');

    ngOnInit() {
        this.loadBoutiques();
    }

    loadBoutiques() {
        this.loading.set(true);
        this.error.set('');
        this.adminService.getBoutiques().subscribe({
            next: (data) => {
                this.boutiques.set(data);
                this.loading.set(false);
            },
            error: (err) => {
                this.error.set(err.error?.error || 'Erreur lors du chargement des boutiques');
                this.loading.set(false);
            }
        });
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
