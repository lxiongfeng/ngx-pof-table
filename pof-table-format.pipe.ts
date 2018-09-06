import {Pipe,PipeTransform} from '@angular/core';

@Pipe({name:'plxTableFormat'})
export class PlxTableFormat implements PipeTransform {
    transform(value: any, format: any) {
        if(!!format){
            return format(value);
        }else{
            return value;
        }
    }
}
