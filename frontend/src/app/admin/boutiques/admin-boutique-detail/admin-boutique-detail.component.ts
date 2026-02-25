import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';

@Component({
    selector: 'app-admin-boutique-detail',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule],
    templateUrl: './admin-boutique-detail.component.html',
})
export class AdminBoutiqueDetailComponent implements OnInit {
    private adminService = inject(AdminService);
    private route = inject(ActivatedRoute);

    boutique = signal<any>(null);
    loading = signal<boolean>(false);
    error = signal<string>('');
    tauxInput = signal<number | null>(null);
    statusOptions = ['active', 'inactive', 'suspendue'];
    saving = signal<boolean>(false);

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id')!;
        this.loading.set(true);
        this.error.set('');
        this.adminService.getBoutiqueById(id).subscribe({
            next: (data) => {
                this.boutique.set(data);
                this.tauxInput.set(data.tauxCommission);
                this.loading.set(false);
            },
            error: (err) => {
                this.error.set(err.error?.error || 'Erreur lors du chargement de la boutique');
                this.loading.set(false);
            }
        });
    }

    setStatus(status: string) {
        this.saving.set(true);
        this.adminService.setBoutiqueStatus(this.boutique()._id, status).subscribe({
            next: (res) => {
                this.boutique.set(res.boutique);
                this.saving.set(false);
            },
            error: (err) => {
                alert(err.error?.error || 'Erreur');
                this.saving.set(false);
            }
        });
    }

    saveCommission() {
        const taux = this.tauxInput();
        if (taux === null) return;
        this.saving.set(true);
        this.adminService.setBoutiqueCommission(this.boutique()._id, taux).subscribe({
            next: (res) => {
                this.boutique.set(res.boutique);
                this.saving.set(false);
            },
            error: (err) => {
                alert(err.error?.error || 'Erreur');
                this.saving.set(false);
            }
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
