import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SidebarService } from '../../shared/service/sidebar.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class Header  {
   constructor(private sidebarService: SidebarService) {}

  onMenuClick(menu: string) {
    this.sidebarService.setMenu(menu);
  }
}
