import { Component } from '@angular/core';
import { MenuItem } from './menu-item';

@Component({
  selector: 'app-navbar-layout',
  templateUrl: './navbar-layout.component.html',
  styleUrls: ['./navbar-layout.component.scss']
})
export class NavbarLayoutComponent {

  sidebarVisible = false;

  constructor() {
    // constructor
  }

  openSidebar(): void {
    this.sidebarVisible = true;
    console.log(this.sidebarVisible)
  }

  closeSidebar(): void {
    this.sidebarVisible = false;
  }
  menuItems: MenuItem[] = [
    {
      link: '/',
      label: 'discover',
      image: '/assets/images/svg/menu/discover.svg',
      activeImage: '/assets/images/svg/menu/discover-active.svg',
      active: false
    },
    {
      link: '/a-propos',
      label: 'a-propos',
      image: '/assets/images/svg/menu/about.svg',
      activeImage: '/assets/images/svg/menu/about-active.svg',
      active: false
    },
    {
      link: '/partenaires',
      label: 'partenaires',
      image: '/assets/images/svg/menu/partners.svg',
      activeImage: '/assets/images/svg/menu/partners-active.svg',
      active: false
    },
    {
      link: '/chiffres',
      label: 'chiffres',
      image: '/assets/images/svg/menu/numbers.svg',
      activeImage: '/assets/images/svg/menu/numbers-active.svg',
      active: false
    }
  ];
}
