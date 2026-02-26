import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, DecimalPipe, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
    selector: 'app-admin-commission-dashboard',
    standalone: true,
    imports: [CommonModule, FormsModule, DecimalPipe, CurrencyPipe, PaginationComponent],
    templateUrl: './admin-commission-dashboard.component.html',
    styleUrl: './admin-commission-dashboard.component.css'
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

    // Pagination Boutique
    totalBoutiquesCount = signal(0);
    currentBoutiquePage = signal(1);
    boutiquePageSize = signal(10);

    // Pagination Mensuelle
    totalMonthsCount = signal(0);
    currentMonthPage = signal(1);
    monthPageSize = signal(12);

    // Stats Globales
    totalCommissions = signal(0);
    nbBoutiques = signal(0);

    ngOnInit() {
        this.loadAll();
    }

    loadAll() {
        this.loading.set(true);
        this.error.set('');

        this.adminService.getCommissionConfig().subscribe({
            next: (c) => {
                this.config.set(c);
                this.nouvelTaux.set(c.tauxGlobal);
            }
        });

        this.loadStats();
        this.loadCommissionsByBoutique();
        this.loadMonthlyCommissions();
    }

    loadStats() {
        this.adminService.getCommissionStats().subscribe({
            next: (s) => {
                this.totalCommissions.set(s.totalCommissions);
                this.nbBoutiques.set(s.nbBoutiques);
            }
        });
    }

    loadCommissionsByBoutique() {
        this.adminService.getCommissionsByBoutique({
            page: this.currentBoutiquePage(),
            limit: this.boutiquePageSize()
        }).subscribe({
            next: (res) => {
                this.commissionsBoutiques.set(res.data);
                this.totalBoutiquesCount.set(res.total);
            }
        });
    }

    loadMonthlyCommissions() {
        this.adminService.getMonthlyCommissions({
            page: this.currentMonthPage(),
            limit: this.monthPageSize()
        }).subscribe({
            next: (res) => {
                this.commissionsMensuelles.set(res.data);
                this.totalMonthsCount.set(res.total);
                this.loading.set(false);
            },
            error: (err) => {
                this.error.set(err.error?.error || 'Erreur lors du chargement des commissions');
                this.loading.set(false);
            }
        });
    }

    onBoutiquePageChange(page: number) {
        this.currentBoutiquePage.set(page);
        this.loadCommissionsByBoutique();
    }

    onMonthPageChange(page: number) {
        this.currentMonthPage.set(page);
        this.loadMonthlyCommissions();
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
        const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
            'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
        return `${months[item._id.month - 1]} ${item._id.year}`;
    }
}
