import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThematiqueComponent } from './thematique/thematique.component';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '../shared/shared.module';
import { SousThematiqueComponent } from './sous-thematique/sous-thematique.component';

@NgModule({
  declarations: [
    ThematiqueComponent,
    SousThematiqueComponent
  ],
  exports: [
    ThematiqueComponent

  ],
  imports: [
    CommonModule,
    TranslateModule,
    SharedModule,
  ]
})
export class ThematiquesModule { }
