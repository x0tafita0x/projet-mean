import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProduitService } from '../../services/produit.service';
import { Produit, SousTypeProduit } from '../../models/produit.models';

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

  produit = signal<Produit>({ nom: '', sousTypeProduit: '', boutique: '' });
  sousTypeProduits = signal<SousTypeProduit[]>([]);
  boutiques = signal<any[]>([]);
  isEdit = signal(false);
  loading = signal(false);
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  ngOnInit() {
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
    this.produitService.getBoutiques().subscribe({
      next: (data) => this.boutiques.set(data),
      error: (err) => console.error('Error loading boutiques', err)
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
    formData.append('boutique', this.produit().boutique || '');

    if (this.selectedFile) {
      formData.append('photo', this.selectedFile);
    }

    const obs = this.isEdit()
      ? this.produitService.updateProduit(this.produit()._id!, formData)
      : this.produitService.createProduit(formData);

    obs.subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/home/produit']);
      },
      error: (err) => {
        this.loading.set(false);
        alert('Erreur lors de l\'enregistrement');
      }
    });
  }
}
