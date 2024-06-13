import { Component } from '@angular/core';
import { MenuItem } from './menu-item';

@Component({
  selector: 'app-navbar-layout',
  templateUrl: './navbar-layout.component.html',
  styleUrls: ['./navbar-layout.component.scss']
})
export class NavbarLayoutComponent {

  places:any[]=[
    
    {
      name:'Nsimalen',
      id:7
    },
    {
      name:'Bamenda',
      id:1
    },
    {
      name:'Bertoua',
      id:2
    },
    {
      name:'Douala',
      id:3
    },
    {
      name:'Garoua',
      id:4
    },
    {
      name:'Maroua-Salak',
      id:5
    },
    {
      name:'Ngaoudéré',
      id:6
    }
  ];
  sidebarVisible = false;

  constructor() {
    // constructor
  }

  openSidebar(): void {
    this.sidebarVisible = true;
  }

  closeSidebar(): void {
    this.sidebarVisible = false;
  }

  setPlace(event: any){
    console.log(event.target.value);
   // this.translateService.setDefaultLang(event.target.value);
  }

  menuItems: MenuItem[] = [
    {
      link: '/',
      label: 'Découvrir',
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
