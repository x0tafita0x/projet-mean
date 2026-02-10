import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarService } from '../../shared/service/sidebar.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class Header {
  constructor(private sidebarService: SidebarService) { }

  onMenuClick(menu: string) {
    this.sidebarService.setMenu(menu);
  }
}
