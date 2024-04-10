import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DarkModeTogglerComponent } from './dark-mode-toggler.component';
import { DarkModeService } from '../../core/service/dark-mode.service';

describe('DarkModeTogglerComponent', () => {
  let component: DarkModeTogglerComponent;
  let fixture: ComponentFixture<DarkModeTogglerComponent>;
  let darkModeService: jasmine.SpyObj<DarkModeService>;

  beforeEach(async () => {
    darkModeService = jasmine.createSpyObj('DarkModeService', ['toggleDarkMode']);

    await TestBed.configureTestingModule({
      imports: [DarkModeTogglerComponent, MatIconModule, MatButtonModule],
      providers: [
        { provide: DarkModeService, useValue: darkModeService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DarkModeTogglerComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call toggleDarkMode() from DarkModeService', () => {
    component.toggleDarkMode();
    expect(darkModeService.toggleDarkMode).toHaveBeenCalled();
  });
});
