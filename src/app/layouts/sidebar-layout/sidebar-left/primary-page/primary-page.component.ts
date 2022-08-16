import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { faLayerGroup } from '@fortawesome/free-solid-svg-icons';
import { MediaMatcher } from '@angular/cdk/layout';
import { Odd } from 'src/app/thematiques/odd';
import {Category} from 'src/app/thematiques/category';
import { Router } from '@angular/router';
import{Thematique,SousThematique} from '../../../../core/interfaces/thematique-interface';

@Component({
  selector: 'app-primary-page',
  templateUrl: './primary-page.component.html',
  styleUrls: ['./primary-page.component.scss']
})
export class PrimaryPageComponent {
  faLayer = faLayerGroup;
  private _mobileQueryListener: () => void;
  private _open = false;
  mobileQuery: MediaQueryList | undefined;
  odds:Odd[]=[]
  //liste des thématiques
  thematiques:Thematique[]=[]
  selectedOdd: Odd | null = null;
  selectedCategories: Category[] = [];

  constructor( private router: Router,media: MediaMatcher,private changeDetectorRef: ChangeDetectorRef,) {

    this.mobileQuery = media.matchMedia('(max-width: 768px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addEventListener('change', this._mobileQueryListener);
    /* TODO document why this constructor is empty */


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

  onSelectOdd(odd: Odd): void {
    this.selectedOdd = odd;
  }

  onCategoriesSelection(categories: Category[]): void {
    this.selectedCategories = categories;
  }

  goToLoginPage(){
    this.router.navigate(['auth/register']);
  }
}
