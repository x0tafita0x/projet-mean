import { Component, OnInit,signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarService } from '../../shared/service/sidebar.service';
import { PanierService } from '../../panier/services/panier.services';
import { AuthService } from '../../auth/services/auth.service';
import { User } from '../../auth/models/auth.models';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class Header {
  constructor(private sidebarService: SidebarService, private panierService: PanierService, private authService: AuthService, private router: Router) { }

  isPanierEmpty = signal<boolean>(true);
  user : User | null = null;
    private minuteTimer!: any;
    

  ngOnInit() {
    this.user = this.authService.currentUser();
    this.checkPanier();
     this.minuteTimer = setInterval(() => {
      this.checkPanier();
    }, 3000);
  }
  onMenuClick(menu: string) {
    this.sidebarService.setMenu(menu);
  }

  checkPanier() {
    if (this.user) {
      this.panierService.isPanierVide(this.user.id).subscribe({
        next: (response) => {
          this.isPanierEmpty.set(response.isEmpty);
        },
        error: (err) => console.error('Error checking panier status', err)
      });
    } else {
      this.isPanierEmpty.set(true); // Si l'utilisateur n'est pas connecté, considérer le panier comme vide
    }
  }
}
