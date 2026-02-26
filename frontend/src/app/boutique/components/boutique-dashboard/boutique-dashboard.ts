import { Component, OnInit, inject, ViewChild, ElementRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BoutiqueService } from '../../services/boutique.services';
import { AuthService } from '../../../auth/services/auth.service';
import { BoutiqueDashboardStats } from '../../models/boutique.models';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-boutique-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './boutique-dashboard.html',
  styleUrl: './boutique-dashboard.css',
})
export class BoutiqueDashboard implements OnInit {
  private boutiqueService = inject(BoutiqueService);
  private authService = inject(AuthService);

  stats = signal<BoutiqueDashboardStats | null>(null);
  loading = signal(true);
  error = signal('');
  filters = signal<{ startDate: string; endDate: string }>({
    startDate: '',
    endDate: ''
  });

  @ViewChild('salesLast7DaysChart') salesLast7DaysChart!: ElementRef;
  @ViewChild('salesByMonthChart') salesByMonthChart!: ElementRef;

  private chart7Days: any;
  private chartByMonth: any;

  ngOnInit() {
    this.initializeMonthFilters();
    const user = this.authService.currentUser();
    if (user && user.boutique) {
      this.loadStats();
    } else {
      this.error.set('Aucune boutique associée à cet utilisateur ou non connecté.');
      this.loading.set(false);
    }
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
      endDate: formatDate(lastDay)
    });
  }

  loadStats() {
    const user = this.authService.currentUser();
    if (!user || !user.boutique) return;

    this.loading.set(true);
    this.boutiqueService.getDashboardStats(user.boutique, this.filters()).subscribe({
      next: (data) => {
        this.stats.set(data);
        this.loading.set(false);
        setTimeout(() => this.initCharts(), 0);
      },
      error: (err) => {
        this.error.set('Erreur lors du chargement des statistiques.');
        this.loading.set(false);
        console.error(err);
      }
    });
  }

  updateFilters(key: 'startDate' | 'endDate', value: string) {
    this.filters.update(prev => ({ ...prev, [key]: value }));
  }

  resetFilters() {
    this.initializeMonthFilters();
    this.loadStats();
  }

  initCharts() {
    if (!this.stats()) return;

    // 7 days chart
    const ctx7Days = this.salesLast7DaysChart?.nativeElement?.getContext('2d');
    if (ctx7Days) {
      if (this.chart7Days) this.chart7Days.destroy();
      this.chart7Days = new Chart(ctx7Days, {
        type: 'line',
        data: {
          labels: this.stats()?.graphiques.ventes7Jours.map(v => v.date),
          datasets: [{
            label: 'Total Ventes (Ariary)',
            data: this.stats()?.graphiques.ventes7Jours.map(v => v.total),
            borderColor: '#4f46e5',
            backgroundColor: 'rgba(79, 70, 229, 0.1)',
            fill: true,
            tension: 0.4
          }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }

    // Month chart
    const ctxMonth = this.salesByMonthChart?.nativeElement?.getContext('2d');
    if (ctxMonth) {
      if (this.chartByMonth) this.chartByMonth.destroy();

      const moisNoms = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

      this.chartByMonth = new Chart(ctxMonth, {
        type: 'bar',
        data: {
          labels: this.stats()?.graphiques.ventesParMois.map(v => moisNoms[v.mois - 1] || v.mois),
          datasets: [{
            label: 'Total Ventes (Ariary)',
            data: this.stats()?.graphiques.ventesParMois.map(v => v.total),
            backgroundColor: '#10b981',
            borderRadius: 4
          }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }
  }
}
