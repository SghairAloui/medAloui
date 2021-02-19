import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcceuilBodyComponent } from './acceuil-body.component';

describe('AcceuilBodyComponent', () => {
  let component: AcceuilBodyComponent;
  let fixture: ComponentFixture<AcceuilBodyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AcceuilBodyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AcceuilBodyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
