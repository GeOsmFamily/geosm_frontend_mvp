import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthLayoutComponent } from './auth-layout/auth-layout.component';
import { SidebarLayoutComponent } from './sidebar-layout/sidebar-layout.component';
import { NavbarLayoutComponent } from './navbar-layout/navbar-layout.component';
import { BaseLayoutComponent } from './base-layout/base-layout.component';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../core/modules/material';
import { PrimaryPageComponent } from './sidebar-layout/sidebar-left/primary-page/primary-page.component';
import { SecondaryPageComponent } from './sidebar-layout/sidebar-left/secondary-page/secondary-page.component';
import { MapComponent } from './sidebar-layout/map/map.component';



@NgModule({
  declarations: [AuthLayoutComponent,SidebarLayoutComponent,NavbarLayoutComponent,BaseLayoutComponent, PrimaryPageComponent, SecondaryPageComponent, MapComponent],
  imports: [
    CommonModule,RouterModule,MaterialModule
  ]
})
export class LayoutsModule { }
