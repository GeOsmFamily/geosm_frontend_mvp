import { Component } from '@angular/core';
import { MenuItem } from './menu-item';

@Component({
  selector: 'app-navbar-layout',
  templateUrl: './navbar-layout.component.html',
  styleUrls: ['./navbar-layout.component.scss']
})
export class NavbarLayoutComponent {
  constructor() {
    // constructor
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
      link: '/about',
      label: 'about',
      image: '/assets/images/svg/menu/about.svg',
      activeImage: '/assets/images/svg/menu/about-active.svg',
      active: false
    },
    {
      link: '/partners',
      label: 'partners',
      image: '/assets/images/svg/menu/partners.svg',
      activeImage: '/assets/images/svg/menu/partners-active.svg',
      active: false
    },
    {
      link: '/numbers',
      label: 'numbers',
      image: '/assets/images/svg/menu/numbers.svg',
      activeImage: '/assets/images/svg/menu/numbers-active.svg',
      active: false
    }
  ];
}
