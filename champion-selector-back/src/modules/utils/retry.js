import { throwError, timer } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

export const genericRetryStrategy = ({
  maxRetryAttempts = 3,
  scalingDuration = 1000
}) => (attempts) => {
  return attempts.pipe(
    mergeMap((error, i) => {
      const retryAttempt = i + 1;
      if (retryAttempt > maxRetryAttempts) {
        return throwError(error);
      }

      console.log(
        `Attempt ${retryAttempt}: retrying in ${retryAttempt * scalingDuration}ms`
      );

      console.error(error);

      return timer(retryAttempt * scalingDuration);
    })
  );
};