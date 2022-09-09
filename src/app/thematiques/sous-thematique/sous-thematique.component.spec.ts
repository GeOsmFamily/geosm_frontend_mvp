import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SousThematiqueComponent } from './sous-thematique.component';

describe('SousThematiqueComponent', () => {
  let component: SousThematiqueComponent;
  let fixture: ComponentFixture<SousThematiqueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SousThematiqueComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SousThematiqueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
