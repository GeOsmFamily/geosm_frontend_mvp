import { TestBed } from '@angular/core/testing';

import { PradecService } from './pradec.service';

describe('PradecService', () => {
  let service: PradecService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PradecService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
