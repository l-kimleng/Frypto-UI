/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import { APP_BASE_HREF } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { CoreModule } from './@core/core.module';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { ThemeModule } from './@theme/theme.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NbAuthModule, NbEmailPassAuthProvider } from '@nebular/auth';
import { OwinTokenAuthProvider } from './auth/providers/owin-token-auth.provider';

const authConfig: any = {
  baseEndpoint: 'http://localhost:50488',
  token: {
    key: 'access_token'
  },
  login: {
    endpoint: '/Token',
    method: 'post',
  },
  register: {
    endpoint: '/api/Account/Register',
    method: 'post',
  },
  logout: {
     endpoint: '/auth/sign-out',
     method: 'post',
   },
   requestPass: {
     endpoint: '/auth/request-pass',
     method: 'post',
   },
   resetPass: {
     endpoint: '/auth/reset-pass',
     method: 'post',
   }
};

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,

    NgbModule.forRoot(),
    ThemeModule.forRoot(),
    CoreModule.forRoot(),
    NbAuthModule.forRoot({
      providers: {
        email: {
          service: OwinTokenAuthProvider,
          config: authConfig
        },
      },
      forms: {
        register: {
          redirectDelay: 0,
          showMessages: {
            success: true            
          }
        }
      }
    })
  ],
  bootstrap: [AppComponent],
  providers: [
    { provide: APP_BASE_HREF, useValue: '/' },
    OwinTokenAuthProvider
  ],
})
export class AppModule {
}
