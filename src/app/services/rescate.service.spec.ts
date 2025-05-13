import { TestBed } from '@angular/core/testing';

import { RescateService } from './rescate.service';

describe('RescateService', () => {
  let service: RescateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RescateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
