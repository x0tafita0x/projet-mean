import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BoutiqueService } from '../../services/boutique.services';
import { Boutique, TypeBoutique } from '../../models/boutique.models';
import { User } from '../../../auth/models/auth.models';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-boutique-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './boutique-form.component.html'
})
export class BoutiqueFormComponent implements OnInit {
  private boutiqueService = inject(BoutiqueService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);

  boutique = signal<Boutique>({ nom: '', typeBoutique: '', heureOuverture: '', heureFermeture: '', numeroTelephone: '' });
  typeBoutiques = signal<TypeBoutique[]>([]);
  isEdit = signal(false);
  loading = signal(false);
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  user: User | null = null;

  ngOnInit() {
    this.user = this.authService.currentUser();
    this.loadMetadata();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.boutiqueService.getBoutiqueById(id).subscribe({
        next: (data: any) => {
          if (data.typeBoutique) {
            data.typeBoutique = (typeof data.typeBoutique === 'object') ? data.typeBoutique._id : data.typeBoutique;
          }

          if (data.boutique) {
            data.boutique = (typeof data.boutique === 'object') ? data.boutique._id : data.boutique;
          }

          this.boutique.set(data);
          if (data.photo) {
            this.imagePreview = `http://localhost:3000/${data.photo}`;
          }
        },
        error: (err) => alert('Erreur lors du chargement de la boutique')
      });
    }
  }

  loadMetadata() {
    this.boutiqueService.getTypeBoutiques({ limit: 1000 }).subscribe({
      next: (response) => this.typeBoutiques.set(response.data),
      error: (err) => console.error('Error loading type boutiques', err)
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
    formData.append('nom', this.boutique().nom);
    formData.append('typeBoutique', (this.boutique().typeBoutique as string) || '');
    formData.append('heureOuverture', this.boutique().heureOuverture);
    formData.append('heureFermeture', this.boutique().heureFermeture);
    formData.append('numeroTelephone', this.boutique().numeroTelephone);

    if (this.selectedFile) {
      formData.append('photo', this.selectedFile);
    }

    const obs = this.isEdit()
      ? this.boutiqueService.updateBoutique(this.boutique()._id!, formData)
      : this.boutiqueService.createBoutique(formData);

    obs.subscribe({
      next: () => {
        this.loading.set(false);
        if (this.user?.role === 'admin') {
          this.router.navigate(['/home/boutique']);
        } else {
          // this.router.navigate(['/home/boutique',this.user?.boutique]);
          alert('Boutique modifiée avec succès !');
        }
      },
      error: (err) => {
        console.error('Error saving boutique', err);
        this.loading.set(false);
        alert('Erreur lors de l\'enregistrement');
      }
    });
  }
}
