import { TestBed } from '@angular/core/testing';
import { DarkModeService } from './dark-mode.service';

describe('DarkModeService', () => {
  let service: DarkModeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DarkModeService]
    });
    service = TestBed.inject(DarkModeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should toggle dark mode', () => {
    let currentToggleValue: boolean | undefined;

    // subscribe to the darkMode$ observable to track changes
    service.darkMode$.subscribe(value => {
      currentToggleValue = value;
    });

    expect(currentToggleValue).toBe(false);

    service.toggleDarkMode();
    expect(currentToggleValue).toBe(true);

    service.toggleDarkMode();
    expect(currentToggleValue).toBe(false);
  });
});
