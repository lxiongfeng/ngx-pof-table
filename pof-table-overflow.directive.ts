import { Directive, Input, TemplateRef, ViewContainerRef, ElementRef, HostListener } from '@angular/core';

@Directive({
    selector: '[plx-table-TdOverflow]'
})
export class PlxTableTdOverflow {
    @Input() popover: any;
    @Input() colConfig:any;

    @HostListener('mouseenter')
    mouseEnter(){
        if (!this.colConfig.class || this.colConfig.class.indexOf('plx-ellipsis') === -1) {
            return;
        }
        let spanElement :Element = this.elementRef.nativeElement;
        let parentElement: Element = this.elementRef.nativeElement.parentElement;
        //delta 为左右两边边框大小
        let delta:number=0;
        if(parentElement.nodeName === 'TH'){
            delta=30;
            // 预留排序图标的宽度
            if (!!this.colConfig.sort) {
                delta += 15;
            }
            // 预留过滤图标的宽度
            if (this.colConfig.filterArray || this.colConfig.selectFilterTemplate) {
                delta += 12;
            }
        }else {
            delta=20;
        }
        // 判断是否字符有超长
        if (spanElement.scrollWidth >= parentElement.clientWidth-delta) {
            this.popover.open();
        }
    }
    @HostListener('mouseleave')
    mouseLeave() {
        this.popover.close();
    }
    constructor(private elementRef: ElementRef) {
      
    }
    ngOnInit() {
       
    }
}
