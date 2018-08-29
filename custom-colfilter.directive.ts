/**
 * Created by lxiongfeng.
 */
import {Directive,Input,TemplateRef,ViewContainerRef} from '@angular/core';

@Directive({
    selector: '[plx-custom-filter]'
})
export class PlxTableCustomFilter{
    @Input() customTemplate:any;
    constructor(private viewContainerRef: ViewContainerRef){

    }
    ngOnInit(){
        if(!!this.customTemplate && !!this.viewContainerRef) {
            this.viewContainerRef.createEmbeddedView(this.customTemplate);
        }
    }
}
