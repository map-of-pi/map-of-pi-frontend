import { TestBed } from '@angular/core/testing';
import { UiStateService } from './ui-state.service';

describe('UiStateService', () => {
  let service: UiStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UiStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
