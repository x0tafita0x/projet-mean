import { Component, OnInit, inject, signal, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnnonceService } from '../../services/annonce.services';
import { Annonce } from '../../models/annonce.models';
import { AuthService } from '../../../auth/services/auth.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
    selector: 'app-annonce-list',
    standalone: true,
    imports: [CommonModule, PaginationComponent],
    templateUrl: './annonce-list.component.html',
    styleUrl: './annonce-list.component.css'
})
export class AnnonceListComponent implements OnInit {
    private annonceService = inject(AnnonceService);
    private authService = inject(AuthService);

    @Input() boutiqueId: string = '';
    annonces = signal<Annonce[]>([]);
    user = this.authService.currentUser();

    // Pagination signals
    currentPage = signal(1);
    pageSize = signal(10);
    totalPages = signal(0);
    totalItems = signal(0);

    ngOnInit() {
        this.refreshAnnonces();
    }

    refreshAnnonces() {
        const id = this.boutiqueId || (this.user?.role === 'boutique' ? this.user?.boutique : '');
        this.loadAnnonces(id || '');
    }

    loadAnnonces(id: string) {
        const criteria = {
            boutiqueId: id,
            page: this.currentPage(),
            limit: this.pageSize()
        };

        this.annonceService.getAnnonces(criteria).subscribe({
            next: (response) => {
                this.annonces.set(response.data);
                this.totalPages.set(response.totalPages);
                this.totalItems.set(response.total);
            },
            error: (err) => console.error('Error loading annonces', err)
        });
    }

    changePage(page: number) {
        if (page >= 1 && page <= this.totalPages()) {
            this.currentPage.set(page);
            this.refreshAnnonces();
        }
    }

    deleteAnnonce(id: string) {
        if (confirm('Supprimer cette annonce ?')) {
            this.annonceService.deleteAnnonce(id).subscribe({
                next: () => {
                    this.refreshAnnonces();
                },
                error: (err) => alert('Erreur lors de la suppression')
            });
        }
    }

    getBoutiqueName(boutique: any): string {
        if (typeof boutique === 'object' && boutique !== null) {
            return boutique.nom || 'Sans nom';
        }
        return 'Boutique'; // Fallback if not populated
    }
}
