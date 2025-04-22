import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetdespachoComponent } from './detdespacho.component';

describe('DetdespachoComponent', () => {
  let component: DetdespachoComponent;
  let fixture: ComponentFixture<DetdespachoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetdespachoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DetdespachoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
