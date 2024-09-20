import { TestBed } from '@angular/core/testing';

import { MogService } from './mog.service';

describe('MogService', () => {
  let service: MogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
