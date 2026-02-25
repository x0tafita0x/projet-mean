import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProduitService } from '../../services/produit.services';
import { MouvementPrixProduitService } from '../../../mouvement-prix-produit/services/mouvement-prix-produit.services';
import { Produit, SousTypeProduit } from '../../models/produit.models';
import { MouvementPrixProduitInsert } from '../../../mouvement-prix-produit/models/mouvement-prix-produit.models';
import { User } from '../../../auth/models/auth.models';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-produit-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './produit-form.component.html'
})
export class ProduitFormComponent implements OnInit {
  private produitService = inject(ProduitService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private mouvementPrixProduitService = inject(MouvementPrixProduitService);
   mouvementPrixProduit = signal<MouvementPrixProduitInsert>({ produit: '', prix: '0' });
  produit = signal<Produit>({ nom: '', sousTypeProduit: '', boutique: '' });
  sousTypeProduits = signal<SousTypeProduit[]>([]);
  user : User | null = null;
  private authService = inject(AuthService);

  isEdit = signal(false);
  loading = signal(false);
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  ngOnInit() {
    this.user = this.authService.currentUser();
    this.loadMetadata();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.produitService.getProduitById(id).subscribe({
        next: (data: any) => {
          if (data.sousTypeProduit) {
            data.sousTypeProduit = (typeof data.sousTypeProduit === 'object') ? data.sousTypeProduit._id : data.sousTypeProduit;
          }

          if (data.boutique) {
            data.boutique = (typeof data.boutique === 'object') ? data.boutique._id : data.boutique;
          }

          this.getPrixActuelle(data._id);
          this.produit.set(data);
          if (data.photo) {
            this.imagePreview = `http://localhost:3000/${data.photo}`;
          }
        },
        error: (err) => alert('Erreur lors du chargement du produit')
      });
    }
  }

  loadMetadata() {
    this.produitService.getSousTypeProduits().subscribe({
      next: (data) => this.sousTypeProduits.set(data),
      error: (err) => console.error('Error loading sous-types', err)
    });
    
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  save() {
    this.loading.set(true);
    const formData = new FormData();
    formData.append('nom', this.produit().nom);
    formData.append('info', this.produit().info || '');
    formData.append('sousTypeProduit', (this.produit().sousTypeProduit as string) || '');
    formData.append('boutique', this.user?.boutique || '');

    if (this.selectedFile) {
      formData.append('photo', this.selectedFile);
    }

    const obs = this.isEdit()
      ? this.produitService.updateProduit(this.produit()._id!, formData)
      : this.produitService.createProduit(formData);

    obs.subscribe({
      next: () => {

  this.mouvementPrixProduitService.createMouvementPrixProduit(this.mouvementPrixProduit()).subscribe({
      next: (data) => console.log('MouvementPrixProduit created', data),
      error: (err) => console.error('Error creating MouvementPrixProduit', err)
    });
        this.loading.set(false);
        this.router.navigate(['/home/produit']);
      },
      error: (err) => {
        this.loading.set(false);
        alert('Erreur lors de l\'enregistrement');
      }
    });
  }

  getPrixActuelle(produitId: string): number {
    
     this.mouvementPrixProduitService.getLastMouvementPrixByProduit(produitId).subscribe({
      next: (data) => {
        console.log('Last MouvementPrixProduit', data);
        this.mouvementPrixProduit.set({
          produit: produitId,
          prix: data.prix.toString() || '0'
        });
        return data.prix;
  }
    });
    return 0;
  }
}
