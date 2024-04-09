import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapCentersManagerComponent } from './map-centers-manager.component';

describe('MapCentersManagerComponent', () => {
  let component: MapCentersManagerComponent;
  let fixture: ComponentFixture<MapCentersManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapCentersManagerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MapCentersManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
