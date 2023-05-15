import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AboutComponent } from './about/about.component';
import { NumbersComponent } from './numbers/numbers.component';
import { PartnersComponent } from './partners/partners.component';
import { PagesRoutingModule } from './pages-routing.module';



@NgModule({
  declarations: [
    AboutComponent,
    NumbersComponent,
    PartnersComponent
  ],
  imports: [
    CommonModule,
    PagesRoutingModule
  ]
})
export class PagesModule { }
