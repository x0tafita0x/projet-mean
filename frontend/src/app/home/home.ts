import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms'; 
import { AuthService } from '../auth/services/auth.service';
import { BoutiqueService } from '../boutique/services/boutique.services';
import { User } from '../auth/models/auth.models';
import { Boutique , TypeBoutique } from '../boutique/models/boutique.models';
import { Achat  } from '../achat/models/achat.models';
import { AchatService } from '../achat/services/achat.services';

@Component({
  selector: 'app-home',
  standalone:true,
  imports: [CommonModule,FormsModule,RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {

    private authService = inject(AuthService);  
    private boutiqueService = inject(BoutiqueService);  
      private achatService = inject(AchatService);

    user : User | null = null;
    boutiques = signal<Boutique[]>([]);
    typeBoutiques = signal<TypeBoutique[]>([]);
    recentAchats = signal<Achat[]>([]);

    typeBoutique : string = '';
    order : string = 'asc';

ngOnInit() {
 this.user = this.authService.currentUser();
this.loadBoutiques();
this.loadTypeBoutique();
this.getRecentAchats();
}

 loadBoutiques() {
    this.boutiqueService.getBoutiques('','','','asc').subscribe({
      next: (data) => this.boutiques.set(data),
      error: (err) => console.error('Error loading boutiques', err)
    });
  }
  loadTypeBoutique(){
    this.boutiqueService.getTypeBoutiques().subscribe({
      next: (data) => this.typeBoutiques.set(data),
      error: (err) => console.error('Error loading boutiques', err)
    });
  }
  getTypeBoutiqueName(stype: string | TypeBoutique): string {
    if (typeof stype === 'object' && stype !== null) {
      return stype.nom;
    }
    return 'N/A';
  }
  filterBoutiques(){
    this.boutiqueService.getBoutiques('',this.typeBoutique,'',this.order).subscribe({
      next: (data) => this.boutiques.set(data),
      error: (err) => console.error('Error loading boutiques', err)
    });
  }
  getRecentAchats(): void {
    this.achatService.getAchatRecent().subscribe({
      next: (data) => {
        this.recentAchats.set(data);
      },
      error: (err) => {
        console.error('Error fetching recent achats:', err);
      }
    });
  }
}
