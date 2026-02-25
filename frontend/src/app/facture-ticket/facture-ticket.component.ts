import { Component, Input,ViewChild,ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Commande, CommandeDetails } from '../commande/models/commande.models';

@Component({
  selector: 'app-facture-ticket',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './facture-ticket.component.html',
  styleUrls: ['./facture-ticket.component.css']
})
export class FactureTicketComponent {


  @Input() commande: CommandeDetails[] = [];
  @Input() data: any = {};
 

  get datePaiement(): string {
    return new Date().toLocaleString();
  }

  get totalPrix(): number {
    return this.commande.reduce(
      (acc: number, p: any) => acc + p.quantite * p.prix,
      0
    );
  }

  get totalQuantite(): number {
    return this.commande.reduce(
      (acc: number, p: any) => acc + p.quantite,
      0
    );
  }

  @ViewChild('facture', { static: false }) factureElement!: ElementRef;

  ngAfterViewInit() {
    // Le DOM est prêt ici, mais on n'exporte pas automatiquement
  }

async exportPDF() {
    if (!this.factureElement) return;

    const element = this.factureElement.nativeElement;
    await this.waitForImages(element);

        // Largeur fixe ticket (ex: 80 mm)
    const ticketWidthMM = 80;

    // Conversion mm → px approximative pour html2canvas
    const pxPerMM = 3.78; // 1 mm ≈ 3.78 px

    const ticketWidthPX = ticketWidthMM * pxPerMM;

    // Déterminer hauteur dynamique du contenu
    const dynamicHeightPX = element.scrollHeight;
    const dynamicHeightMM = dynamicHeightPX / pxPerMM;

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#fff'
    });

    const imgData = canvas.toDataURL('image/jpeg', 1.0);

    const pdf = new jsPDF({
      unit: 'mm',
      format: [ticketWidthMM, dynamicHeightMM]  // largeur 80mm, hauteur dynamique
    });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // Ajouter la première page
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);

    pdf.save(`facture-${this.commande.length > 0 ? this.commande[0]._id : ''}.pdf`);
  }

  private async waitForImages(element: HTMLElement) {
    const images = Array.from(element.querySelectorAll('img'));
    await Promise.all(
      images.map(img =>
        img.complete
          ? Promise.resolve(true)
          : new Promise(resolve => {
              img.onload = () => resolve(true);
              img.onerror = () => resolve(true);
            })
      )
    );
  }
}