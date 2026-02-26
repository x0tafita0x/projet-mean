import { Component, OnInit, inject, signal, effect, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './admin-dashboard.component.html',
    styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
    private adminService = inject(AdminService);

    @ViewChild('dailyChart') dailyChartRef!: ElementRef;
    @ViewChild('monthlyChart') monthlyChartRef!: ElementRef;
    @ViewChild('boutiqueChart') boutiqueChartRef!: ElementRef;
    @ViewChild('productChart') productChartRef!: ElementRef;

    private charts: Chart[] = [];

    // Filters
    filters = signal({
        startDate: '',
        endDate: '',
        boutiqueId: ''
    });

    // Data
    stats = signal<any>(null);
    boutiques = signal<any[]>([]);
    loading = signal(false);
    error = signal('');

    constructor() { }

    ngOnInit() {
        this.initializeMonthFilters();
        this.loadBoutiques();
        this.loadStats();
    }

    private initializeMonthFilters() {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const formatDate = (date: Date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        this.filters.set({
            startDate: formatDate(firstDay),
            endDate: formatDate(lastDay),
            boutiqueId: ''
        });
    }

    loadBoutiques() {
        this.adminService.getBoutiques({ limit: 1000 }).subscribe({
            next: (response) => this.boutiques.set(response.data),
            error: (err) => console.error('Erreur chargement boutiques', err)
        });
    }

    loadStats() {
        this.loading.set(true);
        this.adminService.getDashboardStats(this.filters()).subscribe({
            next: (data) => {
                this.stats.set(data);
                this.loading.set(false);
                setTimeout(() => this.updateCharts(), 0);
            },
            error: (err) => {
                this.error.set(err.error?.error || 'Erreur lors du chargement des stats');
                this.loading.set(false);
            }
        });
    }

    updateFilters(key: string, value: any) {
        this.filters.update(f => ({ ...f, [key]: value }));
    }

    resetFilters() {
        this.initializeMonthFilters();
        this.loadStats();
    }

    private updateCharts() {
        const data = this.stats();
        if (!data) return;

        // Cleanup existing charts
        this.charts.forEach(c => c.destroy());
        this.charts = [];

        // 1. Daily Orders Chart
        this.charts.push(new Chart(this.dailyChartRef.nativeElement, {
            type: 'line',
            data: {
                labels: data.dailyOrders.map((d: any) => d._id),
                datasets: [{
                    label: 'Commandes',
                    data: data.dailyOrders.map((d: any) => d.count),
                    borderColor: '#0d6efd',
                    backgroundColor: 'rgba(13, 110, 253, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        }));

        // 2. Monthly Revenue Chart
        this.charts.push(new Chart(this.monthlyChartRef.nativeElement, {
            type: 'bar',
            data: {
                labels: data.monthlySales.map((m: any) => `${m._id.month}/${m._id.year}`),
                datasets: [{
                    label: 'Chiffre d\'affaires',
                    data: data.monthlySales.map((m: any) => m.revenue),
                    backgroundColor: '#198754'
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        }));

        // 3. Top Boutiques Chart
        this.charts.push(new Chart(this.boutiqueChartRef.nativeElement, {
            type: 'doughnut',
            data: {
                labels: data.topBoutiques.map((b: any) => b.name),
                datasets: [{
                    data: data.topBoutiques.map((b: any) => b.revenue),
                    backgroundColor: ['#0d6efd', '#6610f2', '#6f42c1', '#d63384', '#dc3545']
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        }));

        // 4. Top Products Chart
        this.charts.push(new Chart(this.productChartRef.nativeElement, {
            type: 'polarArea',
            data: {
                labels: data.topProducts.map((p: any) => p.name),
                datasets: [{
                    data: data.topProducts.map((p: any) => p.revenue),
                    backgroundColor: ['#fd7e14', '#ffc107', '#198754', '#20c997', '#0dcaf0']
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        }));
    }
}
