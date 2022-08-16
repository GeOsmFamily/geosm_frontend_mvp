

import { MediaMatcher } from '@angular/cdk/layout';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, AbstractControl, FormControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { ConnectableObservable, finalize } from 'rxjs';
import { Category } from '../category';
import { Odd } from '../odd';
import{Thematique,SousThematique} from '../../core/interfaces/thematique-interface';
import { Couche } from 'src/app/layouts/navbar-layout/searchbar-layout/interfaces/couche';

@Component({
  selector: 'app-thematique',
  templateUrl: './thematique.component.html',
  styleUrls: ['./thematique.component.scss']
})
export class ThematiqueComponent implements OnInit {

  private _mobileQueryListener: () => void;
  @Input() odd!: Thematique;
  @Input() selected = false;
  @Input() forceSelected = false;
  @Input() SousThematiquesSelected = false;
  @Input() lite = false;
  @Output() couchesSelection: EventEmitter<Couche[]> = new EventEmitter<Couche[]>();
  mobileQuery: MediaQueryList;
  form: FormGroup;
  showCouches: boolean = false;
  couches: Couche[] = [];
  SousThematiques:SousThematique[]=[]
  loading: boolean = false;
  logoSize: number = 36;

  constructor(
    private formBuilder: FormBuilder,
    private i18n: TranslateService,
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher,

  ) {
    this.mobileQuery = media.matchMedia('(max-width: 768px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addEventListener('change', this._mobileQueryListener);
    this.form = this.formBuilder.group({
      couches: this.formBuilder.array([])

    });
  }

  ngOnInit(): void {
    if (!this.mobileQuery.matches && (this.lite || this.forceSelected)) {
      this.logoSize = 64;
    }
  }

  toggleCouches(): void {
    this.showCouches = !this.showCouches;

    if (this.showCouches && !this.couches.length) {
      this.getSousThematiques();
    }

    if (!this.showCouches) {
      this.couchesSelection.emit(this.getSelectedCouches());
    }
  }

  getSousThematiques(emit: boolean = false): void {
    this.SousThematiques=this.odd.sous_thematiques
    this.couches=this.odd.sous_thematiques[0].couches
    this.initializeForm();
    if (emit) {
      this.couchesSelection.emit(this.getSelectedCouches());
    }
    this.loading = false;

    /*this.oddService.get(this.odd.id)
      .pipe(
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (odd: Odd|null) => {
          if (odd) {
            this.categories = odd.categories;
          }
          this.initializeForm();
          if (emit) {
            this.categoriesSelection.emit(this.getSelectedCategories());
          }
        }
      });*/
  }

  getCdkConnectedOverlayPanelClasses(): string[] {
    if (this.mobileQuery.matches) {
      return ['fixed', '!top-0', '!bottom-0', '!left-0', '!right-0'];
    }

    return ['max-h-72', '-translate-y-8'];
  }

  getSelectedCouches(): Couche[] {
    const selectedCouches:Couche[] = [];

    const couchesFormControl = this.form.get('couches') as FormArray;
    couchesFormControl.controls.forEach((control: AbstractControl, index: number) => {
      if (control.value) {
        selectedCouches.push(this.couches[index]);
      }
    });

    return selectedCouches;
  }

  getSelectPlaceholder(): string {
    const selectedCouches: Couche[] = this.getSelectedCouches();
    if (this.forceSelected && selectedCouches.length === 0) {
      return this.i18n.instant('text.all_goal_categories', {number: this.odd.id});
    }

    if (!this.allSelected()) {
      const selectedTexts: string[] = [];
      selectedCouches.forEach((category: Couche) => {
        //selectedTexts.push(this.i18n.instant('text.target', {target: category.category_number}));
      });

      //return selectedTexts.join(', ');
    }

    return this.i18n.instant('text.all_goal_categories', {number: this.odd.id});
  }

  allSelected(): boolean {
    return this.form.get('couches')?.value.every((value: boolean) => value);
  }

  initializeForm(): void {
    const checkboxArray: FormArray = this.form.get('couches') as FormArray;
    checkboxArray.clear();
    this.couches.forEach((couche: Couche) => {
      checkboxArray.push(new FormControl(true));
    })
  }

  onSelectAll(event: any): void {
    const couchesFormControl = this.form.get('couches') as FormArray;
    const value = event.target?.checked || false;

    couchesFormControl.controls.forEach((control: AbstractControl) => {
      control.setValue(value);

    });
  }

  onCheckboxChange(event: any, position: number): void {
    const couchesFormControl = this.form.get('couches') as FormArray;
  couchesFormControl.controls.forEach((control: AbstractControl, index: number) => {
      if (position === index) {
        control.setValue(control.value);
      }
    });
  }

  onOverlayKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.toggleCouches();
    }
  }

  onSelected(): void {
    if (this.forceSelected && this.couches.length > 0) {
      this.couches = [];
      this.couchesSelection.emit(this.couches);
      return;
    }

    if (!this.couches.length) {
      this.getSousThematiques(true);
    }
  }

  showHideCoucheSousThematique(){

  }
}
