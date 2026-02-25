import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AdminService } from '../../services/admin.service';

@Component({
    selector: 'app-admin-commande-detail',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './admin-commande-detail.component.html',
})
export class AdminCommandeDetailComponent implements OnInit {
    private adminService = inject(AdminService);
    private route = inject(ActivatedRoute);

    order = signal<any>(null);
    lignes = signal<any[]>([]);
    loading = signal<boolean>(false);
    error = signal<string>('');

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id')!;
        this.loading.set(true);
        this.error.set('');
        this.adminService.getCommandeDetails(id).subscribe({
            next: (data) => {
                this.order.set(data.order);
                this.lignes.set(data.lignes);
                this.loading.set(false);
            },
            error: (err) => {
                this.error.set(err.error?.error || 'Erreur lors du chargement de la commande');
                this.loading.set(false);
            }
        });
    }
}
