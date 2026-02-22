import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule,Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AchatService } from '../../services/achat.services';
import {  Achat } from '../../models/achat.models';
import { AuthService } from '../../../auth/services/auth.service';
import { User } from '../../../auth/models/auth.models';

@Component({
  selector: 'app-achat-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './achat-list.component.html',
  styleUrl: './achat-list.component.css'
})
export class AchatListComponent implements OnInit {
  private achatService = inject(AchatService);
     private authService = inject(AuthService);
     private router = inject(Router);


  achats = signal<Achat[]>([]);
    user : User | null = null;



  ngOnInit() {
      this.user = this.authService.currentUser();
    this.loadAchats();
  }

  loadAchats() {
    this.achatService.getAchatsByUtilisateur(this.user?.id || null).subscribe({
      next: (data) => this.achats.set(data),
      error: (err) => console.error('Error loading achats', err)
    });
  }

 



  }
