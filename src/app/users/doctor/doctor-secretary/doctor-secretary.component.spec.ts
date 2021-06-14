import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorSecretaryComponent } from './doctor-secretary.component';

describe('DoctorSecretaryComponent', () => {
  let component: DoctorSecretaryComponent;
  let fixture: ComponentFixture<DoctorSecretaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DoctorSecretaryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DoctorSecretaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
