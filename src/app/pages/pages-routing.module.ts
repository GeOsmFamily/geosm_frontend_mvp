import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AboutComponent } from './about/about.component';
import { NumbersComponent } from './numbers/numbers.component';
import { PartnersComponent } from './partners/partners.component';

const routes: Routes = [
  {
    path: 'a-propos',
    component: AboutComponent
  },
  {
    path: 'partenaires',
    component: PartnersComponent
  },
  {
    path: 'chiffres',
    component: NumbersComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { }
