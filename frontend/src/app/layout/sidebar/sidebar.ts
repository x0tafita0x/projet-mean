import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarService } from '../../shared/service/sidebar.service';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { User } from '../../auth/models/auth.models';
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class Sidebar implements OnInit {
  currentMenu: string = 'default';
  expandedMenus = signal<string[]>(['Gestion Produits']);
  user: User | null = null;

  private authService = inject(AuthService);
  isAdmin = computed(() => this.authService.currentUser()?.role === 'admin');

  constructor(private sidebarService: SidebarService) { }

  ngOnInit() {
    this.sidebarService.menu$.subscribe(menu => {
      this.currentMenu = menu;
    });
    this.user = this.authService.currentUser();
    console.log('User in Sidebar:', this.user); // Debug: Affiche les informations de l'utilisateur dans la console
  }

  toggleMenu(label: string) {
    const current = this.expandedMenus();
    if (current.includes(label)) {
      this.expandedMenus.set(current.filter(m => m !== label));
    } else {
      this.expandedMenus.set([...current, label]);
    }
  }

  isExpanded(label: string): boolean {
    return this.expandedMenus().includes(label);
  }
}
