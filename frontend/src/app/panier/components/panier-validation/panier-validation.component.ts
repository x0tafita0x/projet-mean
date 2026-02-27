import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PanierService } from '../../services/panier.services';
import { Panier, PanierList } from '../../models/panier.models';
import { AuthService } from '../../../auth/services/auth.service';
import { AchatService } from '../../../achat/services/achat.services';
import { StockService } from '../../../stock/services/stock.services';
import { User } from '../../../auth/models/auth.models';
import { ApiService } from '../../../shared/service/api.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { sign } from 'chart.js/helpers';

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
  private achatService = inject(AchatService);
  private stockService = inject(StockService);
  private router = inject(Router);

  canValidate = signal(false);
  paniers = signal<PanierList[]>([]);
  PaniertoValidate = signal<Panier[]>([]);
  RefBoutique = signal<Panier[]>([]);
  total = signal(0);
  date = new Date();
  dateCommande = this.date.toLocaleDateString('fr-FR');
  dateRecuperation = signal('');
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
      this.purify();
    });
    this.user = this.authService.currentUser();
    this.getDateRecuperation();
  }

  purify() {
    this.total.set(0);
    this.PaniertoValidate.set([]);
    this.RefBoutique.set([]);

    for (const panier of this.paniers()) {
      // For general validation
      const panierIntermediaire: Panier = {
        _id: panier._id,
        utilisateur: panier.utilisateur,
        produit: panier.produit._id,
        prix: panier.prixActuel,
        quantite: panier.quantite,
        etat: 'validé',
        dateHeureRecuperation: panier.dateHeureRecuperation
      };

      // For stock movement (with boutique)
      const panierBoutique: Panier = {
        ...panierIntermediaire,
        boutique: panier.boutique._id || ''
      };
      console.log('Panier à valider:', panier.boutique._id);
      this.total.update(total => total + (panier.prixActuel * panier.quantite));
      this.PaniertoValidate.update(list => [...list, panierIntermediaire]);
      this.RefBoutique.update(list => [...list, panierBoutique]);
    }
  }

getDateRecuperation() {
  this.dateRecuperation.set(new Date(this.paniers()[0].dateHeureRecuperation || '').toLocaleDateString('fr-FR'));
}

  exportPDF() {
    const doc = new jsPDF();
    doc.text("Facture N°000123", 14, 20);
    autoTable(doc, { html: '.facture-table', startY: 30 });
    doc.save('facture.pdf');
  }

  createMouvementStock() {
    const mouvementsStock = [];
    for (const panier of this.RefBoutique()) {
      const mouvementStockIntermediaire = {
        produit: panier.produit,
        in: '0',
        out: panier.quantite.toString(),
        boutique: panier.boutique || ''
      };
      mouvementsStock.push(mouvementStockIntermediaire);
    }
    this.stockService.createStocks(mouvementsStock).subscribe({
      next: (response) => {
        console.log('Mouvements de stock créés avec succès :', response);
      },
      error: (error) => {
        console.error('Erreur lors de la création des mouvements de stock :', error);
      }
    });
  }

  confirmerFacture() {
    const panierIds = this.paniers()
      .filter(p => p._id)
      .map(p => p._id as string);

    if (panierIds.length === 0) {
      alert('Aucun panier à valider.');
      return;
    }

    console.log('Facture confirmée', this.PaniertoValidate());
    this.achatService.createAchat(this.PaniertoValidate());
    this.createMouvementStock();
    this.router.navigate(['/home/achat']);
  }

  annulerFacture() {
    this.router.navigate(['/home/panier']);
  }
}

