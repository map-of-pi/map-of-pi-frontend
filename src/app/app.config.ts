import { APP_INITIALIZER, ApplicationConfig, importProvidersFrom } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { Pi } from '@pinetwork-js/sdk';
import { routes } from './app.routes';
import { environment } from '../environments/environment';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';


export function createTranslateLoader(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    importProvidersFrom(
      TranslateModule.forRoot({
        defaultLanguage: 'en',
        loader: {
          provide: TranslateLoader,
          useFactory: createTranslateLoader,
          deps: [HttpClient],
        },
      }),
    ),
    provideAnimationsAsync(),
    {
      provide: APP_INITIALIZER,
      useFactory: () => () => Pi.init({ version: '2.0', sandbox: environment.isSandbox }),
      multi: true,
    },
    importProvidersFrom(
      LoggerModule.forRoot({
        level: !environment.isSandbox ? NgxLoggerLevel.ERROR : NgxLoggerLevel.DEBUG,
        serverLogLevel: NgxLoggerLevel.OFF,
        timestampFormat: 'YYYY-MM-dd hh:mm:ss.SSS'
      }),
    ),
    DatePipe
  ]
};
