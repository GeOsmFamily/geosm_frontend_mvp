import { ChangeDetectorRef, Component,  OnInit } from '@angular/core';
import { faLayerGroup } from '@fortawesome/free-solid-svg-icons';
import { MediaMatcher } from '@angular/cdk/layout';
import { Odd } from 'src/app/thematiques/odd';
import {Category} from 'src/app/thematiques/category';
import { Router } from '@angular/router';
import{Thematique,SousThematique} from '../../../../core/interfaces/thematique-interface';
import thematiques from '../../../../../assets/geosm.json';
import { Couche } from 'src/app/layouts/navbar-layout/searchbar-layout/interfaces/couche';
import { StorageService } from 'src/app/core/services/api/storage.service';
import { User } from 'src/app/core/auth/interfaces/auth';
import { AuthService } from 'src/app/core/auth/services/auth.service';
import { NotifierService } from 'angular-notifier';
import { AuthState } from 'src/app/core/auth/states/auth.reducer';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectIsLoginSuccess, selectUser } from 'src/app/core/auth/states/auth.selector';
import { FacebookLoginProvider, GoogleLoginProvider, SocialAuthService } from '@abacritt/angularx-social-login';
import { loginFacebook, loginGoogle } from 'src/app/core/auth/states/auth.actions';


@Component({
  selector: 'app-primary-page',
  templateUrl: './primary-page.component.html',
  styleUrls: ['./primary-page.component.scss']
})
export class PrimaryPageComponent implements OnInit{
  faLayer = faLayerGroup;
  private _mobileQueryListener: () => void;
  private _open = false;
  mobileQuery: MediaQueryList | undefined;
  odds:Odd[]=[]
  //liste des thématiques
  thematiques:any
  selectedOdd: Thematique | null = null;
  selectedCouches:  Couche[] = [];
  user$: Observable<User | undefined>;
  isLoginSuccess$: Observable<boolean | undefined>;

  private readonly notifier!: NotifierService;

  constructor(  private store: Store<AuthState>, notifierService: NotifierService, private storageService:StorageService,private router: Router,media: MediaMatcher,private changeDetectorRef: ChangeDetectorRef,private authservice:AuthService, private socialAuthService: SocialAuthService) {

    this.mobileQuery = media.matchMedia('(max-width: 768px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addEventListener('change', this._mobileQueryListener);
    /* TODO document why this constructor is empty */

    this.notifier = notifierService;

    this.user$ = this.store.pipe(select(selectUser));
    this.isLoginSuccess$ = this.store.pipe(select(selectIsLoginSuccess));





  }

  ngOnInit(){
    console.log(thematiques)
    this.thematiques=thematiques.data.thematiques


    for(let i=0;i<this.thematiques.length;i++){
        let nbCouches=0
        let nomCoucheSousThematique=""
        for(let j=0;j<this.thematiques[i].sous_thematiques.length;j++){
          nbCouches+=this.thematiques[i].sous_thematiques[j].couches.length
          if(j==0){
            this.thematiques[i].sous_thematiques[j]["open"]=true
            }
            else{
              this.thematiques[i].sous_thematiques[j]["open"]=false

            }
            for(let k=0;k<this.thematiques[i].sous_thematiques[j].couches.length;k++){
              if(k<2){
                nomCoucheSousThematique=nomCoucheSousThematique+this.thematiques[i].sous_thematiques[j].couches[k].nom+","

              }
            }

      }

        this.thematiques[i]["nbCouches"]=nbCouches
        this.thematiques[i]["nomSousThem"]=nomCoucheSousThematique
    }
    console.log(this.thematiques)
  }
  isOpen(): boolean {
    if (this.mobileQuery?.matches) {
      return this._open;
    }

    return true;
  }

  toggle() {
    this._open = !this._open;
    const body = document.body;
    if (this._open) {
      body.classList.add('overflow-hidden');
    } else {
      body.classList.remove('overflow-hidden');
    }
  }

  onSelectThematique(thematique: Thematique): void {
    this.selectedOdd = thematique;
  }

  onCouchesSelection(couches: Couche[]): void {
    this.selectedCouches = couches;
  }

  goToLoginPage(){
    this.router.navigate(['auth/register']);
  }


  logout(){
    //this.notifier.notify('success', 'Connexion réussie');
    this.authservice.logout().subscribe(response => {
      console.log(response)
      if (response.success) {
        this.notifier.notify('success', 'Déconnexion réussie');
        window.location.reload();
      }
      else{
         this.notifier.notify('error', 'Echec déconnexion');

      }
    });

  }


  loginFacebook() {
    this.socialAuthService.signIn(FacebookLoginProvider.PROVIDER_ID).then(user => {

      this.store.dispatch(loginFacebook({ token: user.authToken }));
      this.isLoginSuccess$.subscribe(isLoginSuccess => {
        if (isLoginSuccess) {
          this.notifier.notify('success', 'Connexion réussie');
          this.router.navigate(['/']);
        }
      });
    });
  }

  loginGoogle() {
    this.socialAuthService
      .signIn(GoogleLoginProvider.PROVIDER_ID, {
        scope: 'profile email'
      })
      .then(user => {
        //this.submitted = true;
        this.store.dispatch(loginGoogle({ token: user.authToken }));
        this.isLoginSuccess$.subscribe(isLoginSuccess => {
          if (isLoginSuccess) {
            this.notifier.notify('success', 'Connexion réussie');
            this.router.navigate(['/']);
          }
        });
      });
  }
}
