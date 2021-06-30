import { OnDestroyDirective } from 'src/app/request/common/components/on-destroy.component';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'nodata',
})
export class NodataPipe extends OnDestroyDirective implements PipeTransform {
    constructor() {
        super();
    }
    transform(value: string | number) {
        if (!value || (value && value.toString() === '0')) {
            return 'не указано';
        }
        return value;
    }
}
