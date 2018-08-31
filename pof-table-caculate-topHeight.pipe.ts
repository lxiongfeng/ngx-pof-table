import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'plxTableCTH' })
export class PlxTableCaculateTopHeight implements PipeTransform {
    transform(value: any, plxTableComponent: any) {
        // 无 plxTableComponent 参数计算margin-top值
        // TODO: plx-table-content 设置为 relative 只需计算表头宽度
        if (!plxTableComponent) {
            return value+2+'px';
        }else{// 计算top值
            if (plxTableComponent.showColFilter) {
                value = value * 2;
            }
            return value + 'px';
        }
      
    }
}
