import {Subscription} from 'rxjs';

/**
 * Unsubscription decorator. Декоратор фоновой отписки.
 */
export function Unsubscription(): Function {
    return function (constructor: Function) {
        const original = constructor.prototype.ngOnDestroy;
        if (typeof original !== 'function') {
            console.warn(
                `OnDestroy is not implemented in ${constructor.name} but it's using @Unsubscription decorator`,
            );
        }
        constructor.prototype.ngOnDestroy = function () {
            for (const prop in this) {
                if (this.hasOwnProperty(prop)) {
                    const sub = this[prop];

                    if (sub && sub instanceof Subscription && !sub.closed) {
                        sub.unsubscribe();
                    }

                    if (sub && sub instanceof Array) {
                        sub.forEach(s => {
                            if (s instanceof Subscription && !s.closed) {
                                s.unsubscribe();
                            }
                        });
                    }
                }
            }
            original.apply(this, arguments);
        };
    };
}
