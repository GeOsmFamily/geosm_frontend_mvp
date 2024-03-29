import { TranslateModule } from '@ngx-translate/core';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingComponent } from './loading/loading.component';
import { ModalComponent } from './modal/modal.component';
import { MaterialModule } from '../core/modules/material';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SocialsharedComponent } from './socialshared/socialshared.component';
import { ShareButtonsConfig } from 'ngx-sharebuttons';
import { ShareButtonsModule } from 'ngx-sharebuttons/buttons';
import { ShareIconsModule } from 'ngx-sharebuttons/icons';

const customConfig: ShareButtonsConfig = {
  include: ['copy', 'facebook', 'twitter', 'linkedin', 'messenger', 'whatsapp'],
  exclude: ['tumblr', 'stumble', 'vk'],
  theme: 'circles-dark',
  gaTracking: true,
  twitterAccount: 'GeOsm_Family'
};

@NgModule({
  declarations: [LoadingComponent, ModalComponent, SocialsharedComponent],
  exports: [LoadingComponent, ModalComponent, SocialsharedComponent],
  imports: [
    CommonModule,
    MaterialModule,
    FontAwesomeModule,
    ReactiveFormsModule,
    TranslateModule,
    ShareButtonsModule.withConfig(customConfig),
    ShareIconsModule
  ]
})
export class SharedModule {}
