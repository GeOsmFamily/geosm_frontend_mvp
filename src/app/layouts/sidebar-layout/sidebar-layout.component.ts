import { Map } from 'src/app/core/modules/openlayers';
import { Component, ViewChild } from '@angular/core';
import { MatSidenavContainer } from '@angular/material/sidenav';
import { map as geoportailMap } from './map/components/map.component';
import { RightMenuInterface } from './sidebar-right/interfaces/rightMenuInterface';

@Component({
  selector: 'app-sidebar-layout',
  templateUrl: './sidebar-layout.component.html',
  styleUrls: ['./sidebar-layout.component.scss']
})
export class SidebarLayoutComponent {
  @ViewChild(MatSidenavContainer, { static: true })
  sidenavContainer: MatSidenavContainer | undefined;

  map: Map | undefined;

  ritghtMenus: Array<RightMenuInterface> = [
    {
      name: 'toc',
      active: false,
      enable: true,
      tooltip: 'toolpit_toc',
      title: 'table_of_contents'
    },
    {
      name: 'edition',
      active: false,
      enable: true,
      tooltip: 'toolpit_tools',
      title: 'tools'
    },
    {
      name: 'legend',
      active: false,
      enable: true,
      tooltip: 'toolpit_legend',
      title: 'legend'
    },
    {
      name: 'routing',
      active: false,
      enable: true,
      tooltip: 'toolpit_map_routing',
      title: 'routing'
    },
    {
      name: 'download',
      active: false,
      enable: true,
      tooltip: 'toolpit_download_data',
      title: 'download'
    }
  ];

  constructor() {
    this.map = geoportailMap;
  }

  getRightMenu(name: string): RightMenuInterface | undefined {
    for (let index = 0; index < this.ritghtMenus!.length; index++) {
      const element = this.ritghtMenus![index];
      if (element.name == name) {
        return element;
      }
    }
    return undefined;
  }

  getRightMenuActive(): RightMenuInterface | undefined {
    for (let index = 0; index < this.ritghtMenus.length; index++) {
      if (this.ritghtMenus[index].active) {
        return this.ritghtMenus[index];
      }
    }
    return undefined;
  }
}
