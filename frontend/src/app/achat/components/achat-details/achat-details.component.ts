import { Component, OnInit, Signal, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute,RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AchatService } from '../../../achat/services/achat.services';
import { Achat, AchatDetails } from '../../../achat/models/achat.models';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { User } from '../../../auth/models/auth.models';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-achat-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './achat-details.component.html',
  styleUrls: ['./achat-details.component.css']
})
export class AchatDetailsComponent implements OnInit {
     private achatService = inject(AchatService);
     private route = inject(ActivatedRoute);
     private authService = inject(AuthService);

    achatsDetails = signal<AchatDetails[]>([]);
    achat = signal<Achat | null>(null);
    total = signal(0);
    user : User | null = null;


ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.loadAchatDetails(id);
    this.loadAchat(id);
    this.user = this.authService.currentUser();
}
loadAchatDetails(achatId: string | null) {
    if (!achatId) {
        console.error('Achat ID is null');
        return;
    }
    this.achatService.getAchatDetails(achatId).subscribe({
      next: (data) => {
        this.achatsDetails.set(data);
        this.total.set(data.reduce((sum, item) => sum + item.prix * item.quantite, 0));
      }
        ,
        error: (err) => console.error('Error loading achat details', err)
    });
}
loadAchat(achatId: string | null) {
    if (!achatId) {
        console.error('Achat ID is null');
        return;
    }
    this.achatService.getAchatById(achatId).subscribe({
      next: (data) => {
        this.achat.set(data);
        },
        error: (err) => console.error('Error loading achat', err)
    });
}

  exportPDF() {
  const doc = new jsPDF();
const achat = this.achat();

if (!achat?.createdAt) {
  return;
}

const dateAchat = new Date(achat.createdAt).toLocaleDateString('fr-FR');
  doc.text("Achat du " + dateAchat, 14, 20);

  // Tableau avec autoTable
  autoTable(doc, { html: '.facture-table', startY: 30 });

  doc.save('facture_'+ dateAchat +'.pdf');
}


  }
