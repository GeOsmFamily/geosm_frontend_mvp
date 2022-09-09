import { MapEffects } from './layouts/sidebar-layout/map/states/map.effects';
import { MultiTranslateHttpLoader } from 'ngx-translate-multi-http-loader';
import { NgModule, Injector } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClient, HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LayoutsModule } from './layouts/layouts.module';
import { SharedModule } from './shared/shared.module';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { setAppInjector } from './core/injectorHelper';
import { mapFeatureKey, mapreducer } from './layouts/sidebar-layout/map/states/map.reducer';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { searchFeatureKey, searchreducer } from './layouts/navbar-layout/searchbar-layout/states/search.reducer';
import { SearchEffects } from './layouts/navbar-layout/searchbar-layout/states/search.effects';
import { ThematiquesModule } from './thematiques/thematiques.module';
import { NotifierModule } from 'angular-notifier';
import { FacebookLoginProvider, GoogleLoginProvider, SocialAuthServiceConfig } from '@abacritt/angularx-social-login';
import { authFeatureKey, authreducer } from './core/auth/states/auth.reducer';
import { AuthEffects } from './core/auth/states/auth.effects';

export function HttpLoaderFactory(httpClient: HttpClient) {
  return new MultiTranslateHttpLoader(httpClient, [{ prefix: './assets/i18n/', suffix: '.json' }]);
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    TranslateModule.forRoot({
      defaultLanguage: 'fr',
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    BrowserAnimationsModule,
    LayoutsModule,
    ThematiquesModule,
    StoreModule.forFeature(searchFeatureKey, searchreducer),
    StoreModule.forFeature(mapFeatureKey, mapreducer),
    StoreModule.forRoot({}, { runtimeChecks: { strictStateImmutability: false, strictActionImmutability: false } }),
    EffectsModule.forRoot([MapEffects, SearchEffects,AuthEffects]),
    StoreModule.forFeature(authFeatureKey, authreducer),

    FontAwesomeModule,
    SharedModule,

    NotifierModule.withConfig({
      position: {
        horizontal: {
          position: 'right',
          distance: 12
        },

        vertical: {
          position: 'top',
          distance: 12,
          gap: 10
        }
      }
    })
  ],
  providers: [
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider('415511598213-s1gpbe2ch3bt1pv6p8jrd01m1nhj1fp6.apps.googleusercontent.com')
          },
          {
            id: FacebookLoginProvider.PROVIDER_ID,
            provider: new FacebookLoginProvider('551433395941902')
          }
        ]
      } as SocialAuthServiceConfig
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(injector: Injector) {
    setAppInjector(injector);
  }
}
