import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthLayoutComponent } from './auth-layout/auth-layout.component';
import { SidebarLayoutComponent } from './sidebar-layout/sidebar-layout.component';
import { NavbarLayoutComponent } from './navbar-layout/navbar-layout.component';
import { BaseLayoutComponent } from './base-layout/base-layout.component';



@NgModule({
  declarations: [AuthLayoutComponent,SidebarLayoutComponent,NavbarLayoutComponent,BaseLayoutComponent],
  imports: [
    CommonModule
  ]
})
export class LayoutsModule { }
