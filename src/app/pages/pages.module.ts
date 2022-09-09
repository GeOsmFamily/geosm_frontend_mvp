import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PagesRoutingModule } from './pages-routing.module';
import { AboutComponent } from './about/about.component';
import { PartnersComponent } from './partners/partners.component';
import { NumbersComponent } from './numbers/numbers.component';


@NgModule({
  declarations: [
    AboutComponent,
    PartnersComponent,
    NumbersComponent
  ],
  imports: [
    CommonModule,
    PagesRoutingModule
  ]
})
export class PagesModule { }
