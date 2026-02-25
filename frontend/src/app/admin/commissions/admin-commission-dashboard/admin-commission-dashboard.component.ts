import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, DecimalPipe, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';

@Component({
    selector: 'app-admin-commission-dashboard',
    standalone: true,
    imports: [CommonModule, FormsModule, DecimalPipe, CurrencyPipe],
    templateUrl: './admin-commission-dashboard.component.html',
})
export class AdminCommissionDashboardComponent implements OnInit {
    private adminService = inject(AdminService);

    config = signal<any>(null);
    nouvelTaux = signal<number>(0);
    commissionsBoutiques = signal<any[]>([]);
    commissionsMensuelles = signal<any[]>([]);
    loading = signal<boolean>(false);
    saving = signal<boolean>(false);
    error = signal<string>('');

    totalCommissions = computed(() => {
        return this.commissionsBoutiques().reduce((s, b) => s + b.totalCommissions, 0);
    });

    ngOnInit() {
        this.loadAll();
    }

    loadAll() {
        this.loading.set(true);
        this.error.set('');

        // On parallélise un peu ou on enchaîne
        this.adminService.getCommissionConfig().subscribe({
            next: (c) => {
                this.config.set(c);
                this.nouvelTaux.set(c.tauxGlobal);
            }
        });

        this.adminService.getCommissionsByBoutique().subscribe({
            next: (d) => {
                this.commissionsBoutiques.set(d);
            }
        });

        this.adminService.getMonthlyCommissions().subscribe({
            next: (d) => {
                this.commissionsMensuelles.set(d);
                this.loading.set(false);
            },
            error: (err) => {
                this.error.set(err.error?.error || 'Erreur lors du chargement des commissions');
                this.loading.set(false);
            }
        });
    }

    saveGlobalRate() {
        this.saving.set(true);
        this.adminService.setGlobalRate(this.nouvelTaux()).subscribe({
            next: (res) => {
                this.config.set(res.config);
                this.saving.set(false);
            },
            error: (err) => {
                alert(err.error?.error || 'Erreur');
                this.saving.set(false);
            }
        });
    }

    monthLabel(item: any): string {
        const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun',
            'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
        return `${months[item._id.month - 1]} ${item._id.year}`;
    }
}
