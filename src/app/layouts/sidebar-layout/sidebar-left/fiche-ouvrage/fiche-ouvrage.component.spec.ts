import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FicheOuvrageComponent } from './fiche-ouvrage.component';

describe('FicheOuvrageComponent', () => {
  let component: FicheOuvrageComponent;
  let fixture: ComponentFixture<FicheOuvrageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FicheOuvrageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FicheOuvrageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
