import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PanierService } from '../../services/panier.services';
import { Panier, PanierList } from '../../models/panier.models';
import { AuthService } from '../../../auth/services/auth.service';
import { User } from '../../../auth/models/auth.models';
import { ApiService } from '../../../shared/service/api.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-panier-validation',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './panier-validation.component.html',
  styleUrl: './panier-validation.component.css'
})
export class PanierValidationComponent implements OnInit {
  private panierService = inject(PanierService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private apiService = inject(ApiService);

  canValidate = signal(false);
  paniers = signal<PanierList[]>([]);
  panierUpdated = signal<Panier>({ utilisateur: '', produit: '', prix: 0, quantite: 1, etat: 'en cours', typeCommande: 'normal' });
  PaniertoValidate = signal<Panier[]>([]);
  total = signal(0);
  date = new Date();
  dateString = this.date.toLocaleDateString('fr-FR');
  user: User | null = null;
  confirming = false;
  confirmed = false;
  achatResult: any = null;

  ngOnInit() {
    this.panierService.data$.subscribe(data => {
      if (data && Object.keys(data).length > 0) {
        this.paniers.set(data);
      } else {
        const produitStr = sessionStorage.getItem('produitSelected');
        if (produitStr) {
          this.paniers.set(JSON.parse(produitStr));
        } else {
          this.router.navigate(['/home/panier']);
        }
      }
    });
    this.purify();
    this.user = this.authService.currentUser();
  }

  purify() {
    for (const panier of this.paniers()) {
      const panierIntermediaire: Panier = {
        utilisateur: panier.utilisateur,
        produit: panier.produit._id,
        prix: panier.prix,
        quantite: panier.quantite,
        etat: 'validé',
        typeCommande: panier.typeCommande
      };
      this.total.update(total => total + (panier.prix * panier.quantite));
      this.PaniertoValidate.update(list => [...list, panierIntermediaire]);
    }
  }

  exportPDF() {
    const doc = new jsPDF();
    doc.text("Facture N°000123", 14, 20);
    autoTable(doc, { html: '.facture-table', startY: 30 });
    doc.save('facture.pdf');
  }

  confirmerFacture() {
    const panierIds = this.paniers()
      .filter(p => p._id)
      .map(p => p._id as string);

    if (panierIds.length === 0) {
      alert('Aucun panier à valider.');
      return;
    }

    this.confirming = true;
    this.apiService.create<any>('panier/valider', { panierIds }).subscribe({
      next: (res) => {
        this.confirming = false;
        this.confirmed = true;
        this.achatResult = res.achat;
        // Nettoyer session
        sessionStorage.removeItem('produitSelected');
      },
      error: (err) => {
        this.confirming = false;
        alert(err.error?.error || 'Erreur lors de la validation.');
      }
    });
  }

  annulerFacture() {
    this.router.navigate(['/home/panier']);
  }
}

