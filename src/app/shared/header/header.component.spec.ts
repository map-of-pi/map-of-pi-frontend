import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { DarkModeService } from '../../core/service/dark-mode.service';
import { TranslateModule } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';

import { Observable, of } from 'rxjs';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let darkMode$: Observable<boolean>;

  beforeEach(async () => {
    darkMode$ = of(false);

    const darkModeServiceMock = {
      darkMode$: darkMode$,
      toggleDarkMode: () => {}
    };

    const activatedRouteStub = {
      snapshot: {
        paramMap: new Map<string, string>()
      }
    };
    
    await TestBed.configureTestingModule({
      imports: [HeaderComponent, TranslateModule.forRoot()],
      providers: [
        { provide: DarkModeService, useValue: darkModeServiceMock },
        { provide: ActivatedRoute, useValue: activatedRouteStub }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Optional Controls section', () => {
    let optionalControls: HTMLElement;

    beforeEach(() => {
      optionalControls = fixture.nativeElement.querySelector('.group-controls');
    });

    it('should exist', () => {
      expect(optionalControls).toBeTruthy();
    });

    it('should contain language switcher component', () => {
      const languageSwitcher = optionalControls.querySelector('app-language-switcher');
      expect(languageSwitcher).toBeTruthy();
    });

    // it('should contain dark mode toggler component', () => {
    //   const darkModeToggler = optionalControls.querySelector('app-dark-mode-toggler');
    //   expect(darkModeToggler).toBeTruthy();
    // });
  });
});
