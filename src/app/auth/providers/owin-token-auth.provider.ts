import { NbAbstractAuthProvider, NbAuthResult } from '@nebular/auth';
import { NgEmailPassAuthProviderConfig } from '@nebular/auth/providers/email-pass-auth.options';
import { HttpResponse, HttpErrorResponse, HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { of as observableOf } from 'rxjs/observable/of';
import { switchMap } from 'rxjs/operators/switchMap';
import { map } from 'rxjs/operators/map';
import { catchError } from 'rxjs/operators/catchError';
import { ActivatedRoute } from '@angular/router';
import { getDeepFromObject } from '../helpers';
import { Injectable } from '@angular/core';

@Injectable()
export class OwinTokenAuthProvider extends NbAbstractAuthProvider {

    protected defaultConfig: NgEmailPassAuthProviderConfig = {
      baseEndpoint: '',
      login: {
        alwaysFail: false,
        rememberMe: true,
        endpoint: '/api/auth/login',
        method: 'post',
        redirect: {
          success: '/',
          failure: null,
        },
        defaultErrors: ['Login/Email combination is not correct, please try again.'],
        defaultMessages: ['You have been successfully logged in.'],
      },
      register: {
        alwaysFail: false,
        rememberMe: true,
        endpoint: '/api/auth/register',
        method: 'post',
        redirect: {
          success: '/',
          failure: null,
        },
        defaultErrors: ['Something went wrong, please try again.'],
        defaultMessages: ['You have been successfully registered.'],
      },
      logout: {
        alwaysFail: false,
        endpoint: '/api/auth/logout',
        method: 'delete',
        redirect: {
          success: '/',
          failure: null,
        },
        defaultErrors: ['Something went wrong, please try again.'],
        defaultMessages: ['You have been successfully logged out.'],
      },
      requestPass: {
        endpoint: '/api/auth/request-pass',
        method: 'post',
        redirect: {
          success: '/',
          failure: null,
        },
        defaultErrors: ['Something went wrong, please try again.'],
        defaultMessages: ['Reset password instructions have been sent to your email.'],
      },
      resetPass: {
        endpoint: '/api/auth/reset-pass',
        method: 'put',
        redirect: {
          success: '/',
          failure: null,
        },
        resetPasswordTokenKey: 'reset_password_token',
        defaultErrors: ['Something went wrong, please try again.'],
        defaultMessages: ['Your password has been successfully changed.'],
      },
      token: {
        key: 'data.token',
        getter: (module: string, res: HttpResponse<Object>) => getDeepFromObject(res.body,
          this.getConfigValue('token.key')),
      },
      errors: {
        key: 'data.errors',
        getter: (module: string, res: HttpErrorResponse) => getDeepFromObject(res.error,
          this.getConfigValue('errors.key'),
          this.getConfigValue(`${module}.defaultErrors`)),
      },
      messages: {
        key: 'data.messages',
        getter: (module: string, res: HttpResponse<Object>) => getDeepFromObject(res.body,
          this.getConfigValue('messages.key'),
          this.getConfigValue(`${module}.defaultMessages`)),
      },
    };

    constructor(protected http: HttpClient, private route: ActivatedRoute) {
      super();
    }

    private encodeParams(params: any): string {
      let body: string = '';
      for (const key in params) {
        if (params.hasOwnProperty(key)) {
          if (body.length) {
            body += '&';
          }
          body += key + '=';
          body += encodeURIComponent(params[key]);
        }
      }
      return body;
    }

    authenticate(data?: any): Observable<NbAuthResult> {
      const method = this.getConfigValue('login.method');
      const url = this.getActionEndpoint('login');
      const myHeader: HttpHeaders = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded'});
      if (data != null) {
          data['grant_type'] = 'password';
          data['username'] = data['email'];
      }
      const dataEncoded = this.encodeParams(data);
      return this.http.request(method, url, {body: dataEncoded, headers: myHeader, observe: 'response'})
        .pipe(
          map((res) => {
            if (this.getConfigValue('login.alwaysFail')) {
              throw this.createFailResponse(data);
            }

            return res;
          }),
          this.validateToken('login'),
          map((res) => {
            return new NbAuthResult(
              true,
              res,
              this.getConfigValue('login.redirect.success'),
              [],
              this.getConfigValue('messages.getter')('login', res),
              this.getConfigValue('token.getter')('login', res));
          }),
          catchError((res) => {
            let errors = [];
            if (res instanceof HttpErrorResponse) {
              errors = this.getConfigValue('errors.getter')('login', res);
            } else {
              errors.push('Something went wrong.');
            }

            return observableOf(
              new NbAuthResult(
                false,
                res,
                this.getConfigValue('login.redirect.failure'),
                errors,
              ));
          }),
        );
    }

    register(data?: any): Observable<NbAuthResult> {
      const method = this.getConfigValue('register.method');
      const url = this.getActionEndpoint('register');
      return this.http.request(method, url, {body: data, observe: 'response'})
        .pipe(
          map((res) => {
            if (this.getConfigValue('register.alwaysFail')) {
              throw this.createFailResponse(data);
            }

            return res;
          }),
          this.validateToken('register'),
          map((res) => {
            return new NbAuthResult(
              true,
              res,
              this.getConfigValue('register.redirect.success'),
              [],
              this.getConfigValue('messages.getter')('register', res),
              this.getConfigValue('token.getter')('register', res));
          }),
          catchError((res) => {
            let errors = [];
            if (res instanceof HttpErrorResponse) {
              errors = this.getConfigValue('errors.getter')('register', res);
            } else {
              errors.push('Something went wrong.');
            }

            return observableOf(
              new NbAuthResult(
                false,
                res,
                this.getConfigValue('register.redirect.failure'),
                errors,
              ));
          }),
        );
    }

    requestPassword(data?: any): Observable<NbAuthResult> {
      const method = this.getConfigValue('requestPass.method');
      const url = this.getActionEndpoint('requestPass');
      return this.http.request(method, url, {body: data, observe: 'response'})
        .pipe(
          map((res) => {
            if (this.getConfigValue('requestPass.alwaysFail')) {
              throw this.createFailResponse();
            }

            return res;
          }),
          map((res) => {
            return new NbAuthResult(
              true,
              res,
              this.getConfigValue('requestPass.redirect.success'),
              [],
              this.getConfigValue('messages.getter')('requestPass', res));
          }),
          catchError((res) => {
            let errors = [];
            if (res instanceof HttpErrorResponse) {
              errors = this.getConfigValue('errors.getter')('requestPass', res);
            } else {
              errors.push('Something went wrong.');
            }

            return observableOf(
              new NbAuthResult(
                false,
                res,
                this.getConfigValue('requestPass.redirect.failure'),
                errors,
              ));
          }),
        );
    }

    resetPassword(data: any = {}): Observable<NbAuthResult> {
      const tokenKey = this.getConfigValue('resetPass.resetPasswordTokenKey');
      data[tokenKey] = this.route.snapshot.queryParams[tokenKey];

      const method = this.getConfigValue('resetPass.method');
      const url = this.getActionEndpoint('resetPass');
      return this.http.request(method, url, {body: data, observe: 'response'})
        .pipe(
          map((res) => {
            if (this.getConfigValue('resetPass.alwaysFail')) {
              throw this.createFailResponse();
            }

            return res;
          }),
          map((res) => {
            return new NbAuthResult(
              true,
              res,
              this.getConfigValue('resetPass.redirect.success'),
              [],
              this.getConfigValue('messages.getter')('resetPass', res));
          }),
          catchError((res) => {
            let errors = [];
            if (res instanceof HttpErrorResponse) {
              errors = this.getConfigValue('errors.getter')('resetPass', res);
            } else {
              errors.push('Something went wrong.');
            }

            return observableOf(
              new NbAuthResult(
                false,
                res,
                this.getConfigValue('resetPass.redirect.failure'),
                errors,
              ));
          }),
        );
    }

    logout(): Observable<NbAuthResult> {

      const method = this.getConfigValue('logout.method');
      const url = this.getActionEndpoint('logout');

      return observableOf({})
        .pipe(
          switchMap((res: any) => {
            if (!url) {
              return observableOf(res);
            }
            return this.http.request(method, url, {observe: 'response'});
          }),
          map((res) => {
            if (this.getConfigValue('logout.alwaysFail')) {
              throw this.createFailResponse();
            }

            return res;
          }),
          map((res) => {
            return new NbAuthResult(
              true,
              res,
              this.getConfigValue('logout.redirect.success'),
              [],
              this.getConfigValue('messages.getter')('logout', res));
          }),
          catchError((res) => {
            let errors = [];
            if (res instanceof HttpErrorResponse) {
              errors = this.getConfigValue('errors.getter')('logout', res);
            } else {
              errors.push('Something went wrong.');
            }

            return observableOf(
              new NbAuthResult(
                false,
                res,
                this.getConfigValue('logout.redirect.failure'),
                errors,
              ));
          }),
        );
    }

    protected validateToken (module: string): any {
      return map((res) => {
        const token = this.getConfigValue('token.getter')(module, res);
        if (!token) {
          const key = this.getConfigValue('token.key');
          console.warn(`NbEmailPassAuthProvider:
                            Token is not provided under '${key}' key
                            with getter '${this.getConfigValue('token.getter')}', check your auth configuration.`);

          throw new Error('Could not extract token from the response.');
        }
        return res;
      });
    }

    protected getActionEndpoint(action: string): string {
      const actionEndpoint: string = this.getConfigValue(`${action}.endpoint`);
      const baseEndpoint: string = this.getConfigValue('baseEndpoint');
      return baseEndpoint + actionEndpoint;
    }
  }

