import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorDiseaseComponent } from './doctor-disease.component';

describe('DoctorDiseaseComponent', () => {
  let component: DoctorDiseaseComponent;
  let fixture: ComponentFixture<DoctorDiseaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DoctorDiseaseComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DoctorDiseaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
