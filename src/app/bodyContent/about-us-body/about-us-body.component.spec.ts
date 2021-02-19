import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AboutUsBodyComponent } from './about-us-body.component';

describe('AboutUsBodyComponent', () => {
  let component: AboutUsBodyComponent;
  let fixture: ComponentFixture<AboutUsBodyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AboutUsBodyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AboutUsBodyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
