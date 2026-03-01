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

    get chartPeriodLabel(): string {
        const { startDate, endDate } = this.filters();
        if (startDate && endDate) {
            const fmt = (d: string) => {
                const [y, m, day] = d.split('-');
                return `${day}/${m}/${y}`;
            };
            return `${fmt(startDate)} – ${fmt(endDate)}`;
        } else if (startDate) {
            const [y, m, day] = startDate.split('-');
            return `à partir du ${day}/${m}/${y}`;
        } else if (endDate) {
            const [y, m, day] = endDate.split('-');
            return `jusqu'au ${day}/${m}/${y}`;
        }
        return '7 derniers jours';
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
                    backgroundColor: 'rgba(13, 110, 253, 0.15)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: '#0d6efd'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false } // We have the title in the card header
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { precision: 0 } // Integer only for orders
                    }
                }
            }
        }));

        // 2. Monthly Revenue Chart
        this.charts.push(new Chart(this.monthlyChartRef.nativeElement, {
            type: 'bar',
            data: {
                labels: data.monthlySales.map((m: any) => `${m._id.month}/${m._id.year}`),
                datasets: [{
                    label: 'Chiffre d\'affaires',
                    data: data.monthlySales.map((m: any) => m.revenue),
                    backgroundColor: 'rgba(25, 135, 84, 0.8)',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                }
            }
        }));

        // 3. Top Boutiques Chart
        this.charts.push(new Chart(this.boutiqueChartRef.nativeElement, {
            type: 'doughnut',
            data: {
                labels: data.topBoutiques.map((b: any) => b.name),
                datasets: [{
                    data: data.topBoutiques.map((b: any) => b.revenue),
                    backgroundColor: [
                        'rgba(13, 110, 253, 0.85)',
                        'rgba(102, 16, 242, 0.85)',
                        'rgba(111, 66, 193, 0.85)',
                        'rgba(214, 51, 132, 0.85)',
                        'rgba(220, 53, 69, 0.85)'
                    ],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            boxWidth: 12,
                            padding: 15,
                            font: { size: 11 }
                        }
                    }
                },
                cutout: '65%' // Thinner doughnut for elegance
            }
        }));

        // 4. Top Products Chart - Using Horizontal Bar for better comparison of skewed revenue
        // Dynamic scale selection: use log if gap is huge (> 15x), linear otherwise.
        const productStats = data.topProducts;
        let scaleType: 'linear' | 'logarithmic' = 'linear';
        if (productStats.length > 0) {
            const values = productStats.map((p: any) => p.revenue);
            const max = Math.max(...values);
            const min = Math.min(...values.filter((v: number) => v > 0) || [0]) as number;
            if (min > 0 && (max / min) > 15) {
                scaleType = 'logarithmic';
            }
        }

        this.charts.push(new Chart(this.productChartRef.nativeElement, {
            type: 'bar',
            data: {
                labels: productStats.map((p: any) => p.name),
                datasets: [{
                    label: 'Chiffre d\'affaires (MGA)',
                    data: productStats.map((p: any) => p.revenue),
                    backgroundColor: [
                        'rgba(253, 126, 20, 0.8)',
                        'rgba(255, 193, 7, 0.8)',
                        'rgba(25, 135, 84, 0.8)',
                        'rgba(32, 201, 151, 0.8)',
                        'rgba(13, 202, 240, 0.8)'
                    ],
                    borderRadius: 4,
                    minBarLength: 15 // Garanti une visibilité minimale même pour les petits montants
                }]
            },
            options: {
                indexAxis: 'y', // Makes it a horizontal bar chart
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                let value = context.parsed.x;
                                return value !== null ? ` ${value.toLocaleString()} MGA` : ' 0 MGA';
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        type: scaleType,
                        title: { display: false },
                        ticks: {
                            callback: function (value: any) {
                                // Simplify large numbers (1M, 10k, etc)
                                if (value >= 1000000) return (value / 1000000) + 'M';
                                if (value >= 1000) return (value / 1000) + 'k';
                                return value;
                            }
                        }
                    },
                    y: {
                        ticks: {
                            autoSkip: false,
                            font: { size: 11 }
                        }
                    }
                }
            }
        }));
    }
}
