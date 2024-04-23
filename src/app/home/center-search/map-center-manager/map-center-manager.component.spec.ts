import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapCenterManagerComponent } from './map-center-manager.component';

describe('MapCenterManagerComponent', () => {
  let component: MapCenterManagerComponent;
  let fixture: ComponentFixture<MapCenterManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapCenterManagerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MapCenterManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
