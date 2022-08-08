import { NgModule } from '@angular/core';
import { NgIconsModule } from '@ng-icons/core';
import {
  HeroArrowRight,
  HeroCheck,
  HeroChevronDown,
  HeroChevronUp,
  HeroGlobe,
  HeroGlobeAlt,
  HeroInformationCircleSolid,
  HeroLocationMarkerSolid,
  HeroMailSolid,
  HeroMenu,
  HeroPhoneSolid,
  HeroPlus,
  HeroSearch,
  HeroShare,
  HeroUserSolid,
  HeroX
} from '@ng-icons/heroicons';
import {
  IonLogoFacebook,
  IonLogoTwitter,
  IonLogoInstagram,
  IonLogoLinkedin,
  IonMail,
  IonCall
} from '@ng-icons/ionicons';
import { FeatherPlusSquare, FeatherMinusSquare } from '@ng-icons/feather-icons';



@NgModule({
  exports: [NgIconsModule],
  imports: [
    NgIconsModule.withIcons({
      FeatherMinusSquare,
      FeatherPlusSquare,
      IonLogoFacebook,
      IonLogoTwitter,
      IonLogoInstagram,
      IonLogoLinkedin,
      IonMail,
      IonCall,
      HeroArrowRight,
      HeroCheck,
      HeroChevronDown,
      HeroChevronUp,
      HeroGlobe,
      HeroGlobeAlt,
      HeroInformationCircleSolid,
      HeroLocationMarkerSolid,
      HeroMailSolid,
      HeroMenu,
      HeroPhoneSolid,
      HeroPlus,
      HeroSearch,
      HeroShare,
      HeroUserSolid,
      HeroX
    }),
  ]
})
export class IconsModule { }
