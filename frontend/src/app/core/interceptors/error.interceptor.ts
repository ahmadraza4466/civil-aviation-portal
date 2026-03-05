import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import Swal from 'sweetalert2';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            let errorMsg = '';
            if (error.error instanceof ErrorEvent) {
                errorMsg = `Error: ${error.error.message}`;
            } else {
                errorMsg = `Error Code: ${error.status}\nMessage: ${error.message}`;
            }

            Swal.fire({
                icon: 'error',
                title: 'API Error',
                text: 'Something went wrong! ' + errorMsg,
                confirmButtonColor: '#3085d6'
            });

            return throwError(() => error);
        })
    );
};
