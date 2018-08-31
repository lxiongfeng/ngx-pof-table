import { Directive, Input, TemplateRef, ElementRef } from '@angular/core';

@Directive({
    selector: '[plx-table-col-width]'
})
export class PlxTableCaculateColsWidth {
    @Input() col: any;
    @Input() colsNativeElement: any;
    @Input() isLast: any;
    selfData:any;
    constructor(private elementRef: ElementRef) {
       
    }
    ngOnInit() {
       
    }
    ngAfterViewInit() {
        // 将列的 nativeElement 附加到col上
        this.col['nativeElement'] = this.elementRef.nativeElement;
    }
    ngOnDestroy(): void {
        this.col.nativeElement=null;
    }
}
