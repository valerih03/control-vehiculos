import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DespacharComponent } from './despachar.component';

describe('DespacharComponent', () => {
  let component: DespacharComponent;
  let fixture: ComponentFixture<DespacharComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DespacharComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DespacharComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
