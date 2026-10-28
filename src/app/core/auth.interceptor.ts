import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, finalize, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { UiService } from './ui.service';

/**
 * - Adds the bearer token to requests for this app's own URLs
 * - Tracks pending requests for a global loading indicator
 * - Handles 401 (sign out + redirect to login) and 403 (redirect to forbidden)
 * - Announces errors to assistive technology
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const ui = inject(UiService);

  const isOwnRequest = !/^https?:\/\//i.test(req.url);
  const token = auth.token();
  const authReq =
    isOwnRequest && token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  ui.startLoading();
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        auth.logout();
        ui.announce('Your session has expired. Please sign in again.');
        router.navigate(['/login'], { queryParams: { returnUrl: router.url } });
      } else if (error.status === 403) {
        router.navigate(['/forbidden']);
      } else {
        ui.announce('Something went wrong while loading data. Please try again.');
      }
      return throwError(() => error);
    }),
    finalize(() => ui.stopLoading()),
  );
};
