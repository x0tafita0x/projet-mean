import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink,Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PanierService } from '../../services/panier.services';
import { Panier, PanierList } from '../../models/panier.models';
import { AuthService } from '../../../auth/services/auth.service';
import { AchatService } from '../../../achat/services/achat.services';
import { StockService } from '../../../stock/services/stock.services';
import { User } from '../../../auth/models/auth.models';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-panier-validation',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
  total = signal(0);
  date = new Date();
  dateString = this.date.toLocaleDateString('fr-FR');
    user : User | null = null;
ngOnInit() {
  this.panierService.data$.subscribe(data => {
    if (data && Object.keys(data).length > 0) {
        console.log('Données reçues du service :', data);
      this.paniers.set(data);
    } else {
      const produitStr = sessionStorage.getItem('produitSelected');
      if (produitStr) {
        console.log('Données récupérées de la session :', produitStr);
        this.paniers.set(JSON.parse(produitStr));
      }else{
        this.router.navigate(['/home/panier']);
      }
    }
  });
  this.purify();
  this.user = this.authService.currentUser();
}
  purify(){
     for (const panier of this.paniers()) {
      const panierIntermediaire: Panier = {
        _id: panier._id,
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

  // Tableau avec autoTable
  autoTable(doc, { html: '.facture-table', startY: 30 });

  doc.save('facture.pdf');
}

createMouvementStock() {
  const mouvementsStock = [];
  for (const panier of this.PaniertoValidate()) {
    const mouvementStockIntermediaire = {
      produit: panier.produit,
      in: '0',
      out: panier.quantite.toString()
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
  // Action à effectuer quand on confirme la facture
  console.log('Facture confirmée', this.PaniertoValidate());
  this.achatService.createAchat(this.PaniertoValidate());
  this.createMouvementStock();
  this.router.navigate(['/home/achat']);
  // Ici tu peux déclencher l'export PDF, l'enregistrement, etc.
}

annulerFacture() {
 this.router.navigate(['/home/panier']);
}

  }
