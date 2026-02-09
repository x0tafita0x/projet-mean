import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarService } from '../../shared/service/sidebar.service';
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule], 
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css'] 
})
export class Sidebar implements OnInit {
 currentMenu: string = 'default';

  constructor(private sidebarService: SidebarService) {}

  ngOnInit() {
    this.sidebarService.menu$.subscribe(menu => {
      this.currentMenu = menu;
    });
  }
}
