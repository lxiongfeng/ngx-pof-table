import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'plxTableOverflow' })
export class PlxTableOverflow implements PipeTransform {
    transform(classValue: string) {
        if (!!classValue && classValue.indexOf('plx-ellipsis')!== -1) {
            return true;
        }else {
            return false;
        }
    }
}
