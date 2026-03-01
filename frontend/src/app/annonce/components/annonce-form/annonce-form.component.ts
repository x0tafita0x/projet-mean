import { Component, inject, signal, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnnonceService } from '../../services/annonce.services';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
    selector: 'app-annonce-form',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './annonce-form.component.html',
    styleUrl: './annonce-form.component.css'
})
export class AnnonceFormComponent {
    private annonceService = inject(AnnonceService);
    private authService = inject(AuthService);

    @Output() annonceCreated = new EventEmitter<void>();

    contenu = signal('');
    selectedFiles: File[] = [];
    previews = signal<string[]>([]);
    isSubmitting = signal(false);

    onFileSelected(event: any) {
        const files: FileList = event.target.files;
        if (files) {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                if (this.selectedFiles.length >= 5) break;

                this.selectedFiles.push(file);
                const reader = new FileReader();
                reader.onload = (e: any) => {
                    this.previews.update(p => [...p, e.target.result]);
                };
                reader.readAsDataURL(file);
            }
        }
    }

    removePhoto(index: number) {
        this.selectedFiles.splice(index, 1);
        this.previews.update(p => {
            const newList = [...p];
            newList.splice(index, 1);
            return newList;
        });
    }

    onSubmit() {
        const user = this.authService.currentUser();
        if (!user || !user.boutique || !this.contenu()) return;

        this.isSubmitting.set(true);
        const formData = new FormData();
        formData.append('boutique', user.boutique);
        formData.append('contenu', this.contenu());

        this.selectedFiles.forEach(file => {
            formData.append('photos', file);
        });

        this.annonceService.createAnnonce(formData).subscribe({
            next: () => {
                this.contenu.set('');
                this.selectedFiles = [];
                this.previews.set([]);
                this.isSubmitting.set(false);
                this.annonceCreated.emit();
                alert('Annonce publiée !');
            },
            error: (err) => {
                console.error(err);
                this.isSubmitting.set(false);
                alert('Erreur lors de la publication');
            }
        });
    }
}
