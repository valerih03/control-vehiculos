import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RescateComponent } from './rescate.component';

describe('RescateComponent', () => {
  let component: RescateComponent;
  let fixture: ComponentFixture<RescateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RescateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RescateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
