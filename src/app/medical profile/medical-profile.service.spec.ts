import { TestBed } from '@angular/core/testing';

import { MedicalProfileService } from './medical-profile.service';

describe('MedicalProfileService', () => {
  let service: MedicalProfileService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MedicalProfileService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
