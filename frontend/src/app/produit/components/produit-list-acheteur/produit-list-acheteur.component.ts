import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { Router, RouterModule,ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms'; 
import { ProduitService } from '../../../produit/services/produit.service';
import { Produit ,ProduitDetail, SousTypeProduit } from '../../../produit/models/produit.models';

@Component({
  selector: 'app-home',
  standalone:true,
  imports: [CommonModule,FormsModule,RouterModule],
  templateUrl: './produit-list-acheteur.component.html',
  styleUrl: './produit-list-acheteur.component.css'
})
export class ProduitListAcheteurComponent {

    private produitService = inject(ProduitService);  
    private route = inject(ActivatedRoute);

    produitSelectionne = signal<ProduitDetail>({ _id: '', nom: '', sousTypeProduit: { _id: '', nom: '', typeProduit: { _id: '', nom: '' } }, boutique: { _id: '', nom: '' } });
    showDetails = signal(false);
    produits = signal<Produit[]>([]);
    sousTypeProduits = signal<SousTypeProduit[]>([]);

    typeBoutique : string = '';
    order : string = 'asc';

ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
this.loadProduits(id);
this.loadSousTypeProduits();
}

 loadProduits(id: string | null) {
    this.produitService.getProduitsByBoutiqueId(id).subscribe({
      next: (data) => this.produits.set(data),
      error: (err) => console.error('Error loading produits', err)
    });
  }
  loadSousTypeProduits(){
    this.produitService.getSousTypeProduits().subscribe({
      next: (data) => this.sousTypeProduits.set(data),
      error: (err) => console.error('Error loading sous type produits', err)
    });
  }
  getSousTypeProduitName(stype: string | SousTypeProduit): string {
    if (typeof stype === 'object' && stype !== null) {
      return stype.nom;
    }
    return 'N/A';
  }

  loadProduitsDetails(id: string | null) {
    this.produitService.getProduitById(id).subscribe({
      next: (data) => this.produitSelectionne.set(data),
      error: (err) => console.error(err)
    });
  }

  selectProduit(produit: Produit) {
    this.loadProduitsDetails(produit._id as string || null);
    this.showDetails.set(true);
  }

  fermerDetails() {
    this.showDetails.set(false);
    this.produitSelectionne.set({ _id: '', nom: '', sousTypeProduit: { _id: '', nom: '', typeProduit: { _id: '', nom: '' } }, boutique: { _id: '', nom: '' } });
  }
//   filterProduits(){
//     this.produitService.getProduits().subscribe({
//       next: (data) => this.produits.set(data),
//       error: (err) => console.error('Error loading produits', err)
//     });
//   }
  


}
