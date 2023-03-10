import { Map } from 'src/app/core/modules/openlayers';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSidenavContainer } from '@angular/material/sidenav';
import { map as geoportailMap } from './map/components/map.component';
import { RightMenuInterface } from './sidebar-right/interfaces/rightMenuInterface';
import { SecondaryPageComponent } from './sidebar-left/secondary-page/secondary-page.component';
import { ComponentHelper } from 'src/app/core/modules/componentHelper';

@Component({
  selector: 'app-sidebar-layout',
  templateUrl: './sidebar-layout.component.html',
  styleUrls: ['./sidebar-layout.component.scss']
})
export class SidebarLayoutComponent implements OnInit {
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

  @ViewChild(SecondaryPageComponent, { static: true })
  secondaryPage: SecondaryPageComponent | undefined;

  constructor(public componentHelper: ComponentHelper) {
    this.map = geoportailMap;
  }
  ngOnInit(): void {
  }

  // eslint-disable-next-line @angular-eslint/use-lifecycle-interface
  ngAfterViewInit() {
    console.log(this.secondaryPage)
    this.componentHelper.setComponent('SecondaryPageComponent', this.secondaryPage);
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
