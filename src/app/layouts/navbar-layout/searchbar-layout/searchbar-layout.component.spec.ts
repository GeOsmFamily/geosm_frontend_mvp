import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchbarLayoutComponent } from './searchbar-layout.component';

describe('SearchbarLayoutComponent', () => {
  let component: SearchbarLayoutComponent;
  let fixture: ComponentFixture<SearchbarLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SearchbarLayoutComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchbarLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
