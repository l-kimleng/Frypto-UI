import { ExtraOptions, RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import {
  NbAuthComponent,
  NbLoginComponent,
  NbLogoutComponent,
  NbRegisterComponent,
  NbRequestPasswordComponent,
  NbResetPasswordComponent,
  NbAuthModule,
  NbEmailPassAuthProvider,
} from '@nebular/auth';

const routes: Routes = [
  { path: 'pages', loadChildren: 'app/pages/pages.module#PagesModule' },
  {
    path: 'auth',
    component: NbAuthComponent,
    children: [
      {
        path: '',
        component: NbLoginComponent,
      },
      {
        path: 'login',
        component: NbLoginComponent,
      },
      {
        path: 'register',
        component: NbRegisterComponent,
      },
      {
        path: 'logout',
        component: NbLogoutComponent,
      },
      {
        path: 'request-password',
        component: NbRequestPasswordComponent,
      },
      {
        path: 'reset-password',
        component: NbResetPasswordComponent,
      },
    ],
  },
  { path: '', redirectTo: 'pages', pathMatch: 'full' },
  { path: '**', redirectTo: 'pages' },
];

const config: ExtraOptions = {
  useHash: true,
};

@NgModule({
  imports: [
    RouterModule.forRoot(routes, config),
    NbAuthModule.forRoot({
      providers: {
        email: {
          service: NbEmailPassAuthProvider,
          config: {
            baseEndpoint: 'http://localhost:50488/',
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
          },
        },
      },
    }) 
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {
}
