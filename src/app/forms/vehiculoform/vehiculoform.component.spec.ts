import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VehiculoformComponent } from './vehiculoform.component';

describe('VehiculoformComponent', () => {
  let component: VehiculoformComponent;
  let fixture: ComponentFixture<VehiculoformComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VehiculoformComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VehiculoformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
