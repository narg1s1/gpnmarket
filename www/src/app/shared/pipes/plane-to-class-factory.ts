import {Observable, pipe, UnaryFunction} from 'rxjs';
import {plainToClass} from 'class-transformer';
import {map} from 'rxjs/operators';

export function p2cFactory<T, R>(cls): UnaryFunction<Observable<T>, Observable<R>> {
    return pipe(
        map<T, R>((plain: T) => {
            return plainToClass(cls, plain);
        }),
    );
}
