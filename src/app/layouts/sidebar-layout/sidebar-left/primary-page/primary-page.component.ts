import { ChangeDetectorRef, Component,  OnInit } from '@angular/core';
import { faLayerGroup } from '@fortawesome/free-solid-svg-icons';
import { MediaMatcher } from '@angular/cdk/layout';
import { Odd } from 'src/app/thematiques/odd';
import {Category} from 'src/app/thematiques/category';
import { Router } from '@angular/router';
import{Thematique,SousThematique} from '../../../../core/interfaces/thematique-interface';
import thematiques from '../../../../../assets/geosm.json';
import { Couche } from 'src/app/layouts/navbar-layout/searchbar-layout/interfaces/couche';


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

  constructor( private router: Router,media: MediaMatcher,private changeDetectorRef: ChangeDetectorRef,) {

    this.mobileQuery = media.matchMedia('(max-width: 768px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addEventListener('change', this._mobileQueryListener);
    /* TODO document why this constructor is empty */



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
}
