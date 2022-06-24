import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { CarteService } from './carte.service';

describe('CarteService', () => {
  let service: CarteService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      providers: [CarteService]
    });
    service = TestBed.inject(CarteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
