import {
    Component, OnInit, ApplicationRef, Injector, ComponentFactoryResolver, Input,
    AfterViewInit, ViewContainerRef, ViewChild, ChangeDetectorRef,OnChanges, ViewEncapsulation
} from '@angular/core';
import {PlxTableService} from "../classes/plx-table.service";


@Component({
    selector: 'plx-table-cell',
    encapsulation: ViewEncapsulation.None,
    template: `
        <div>
            <div #vc>

            </div>
        </div>    
    `,
    styleUrls: ['plx-table-cell.component.css'],
    providers: [PlxTableService]

})
export class PlxTableCellComponent implements AfterViewInit,OnChanges {

    @Input() allData:any;
    private _componentInputs:any;
    // 自定义组件传入的 input 绑定
    @Input() 
    set componentInputs(value: any){
        this._componentInputs=value;
    }
    get componentInputs(){
        return this._componentInputs;
    }
    // 自定义组件传入的output 绑定 
    @Input() componentOutputs: any;

    @Input() componentName: any;

    private _rowIndex: number;
    @Input()
    public set rowIndex(value: number){
        this._rowIndex=value;
        if(!!this.pxTableService) {
            this.pxTableService.setRowIndex(this._rowIndex);
        }
    };
    public get rowIndex() {
        return this._rowIndex;
    }

    private _colIndex:number;
    @Input()
    public set colIndex(value: number) {
        this._colIndex=value;
        if(!!this.pxTableService) {
            this.pxTableService.setColIndex(this._colIndex);
        }

    };
    public get colIndex() {
        return this._colIndex;
    }

    private _currentTotalRows: number;
    @Input()
    set currentTotalRows(value: number){
        this._currentTotalRows=value;
        if(!!this.pxTableService) {
            this.pxTableService.setCurrrentTotalRows(this._currentTotalRows);
        }
    };
    get currentTotalRows(){
        return this._currentTotalRows;
    }

    private _currentTotalCols:number;
    @Input()
    set currentTotalCols(value: number) {
        this._currentTotalCols=value;
        if(!!this.pxTableService) {
            this.pxTableService.setCurrentTotalCols(this._currentTotalCols);
        }
    }
    get currentTotalCols() {
        return this._currentTotalCols
    }

    private  _currentRowData:any;
    @Input()
    set currentRowData(value: any){
        this._currentRowData=value;
        if(!!this.pxTableService) {
            this.pxTableService.setCurrentRowData(this._currentRowData);
        }
    }
    get currentRowData(){
        return this._currentRowData;
    }

    private _currentColConfig;
    @Input()
    set currentColConfig(value: any) {
        this._currentColConfig=value;
        if(!!this.pxTableService) {
            this.pxTableService.setCurrentColumn(this._currentColConfig);
        }
    }
    get currentColConfig() {
        return this._currentColConfig;
    }

    private _columns:any;
    @Input()
    set columns(value:any){
        this._columns=value;
        if(!!this.pxTableService) {
            this.pxTableService.setColumns(this._columns);
        }
    }
    get columns() {
        return this._columns;
    }


    @ViewChild('vc', {read: ViewContainerRef}) public vc: ViewContainerRef;

    private componentFactory:any;

    private componentRef:any;

    constructor(private _applicationRef: ApplicationRef, private _injector: Injector,
                private _componentFactoryResolver: ComponentFactoryResolver,
                private pxTableService:PlxTableService,
                private cdr:ChangeDetectorRef) {
    }

    ngOnInit() {
        this.pxTableService.setPositionInfo(this.rowIndex,this.colIndex,
            this.currentTotalRows,this.currentTotalCols,this.columns,this.currentRowData,this.currentColConfig);
        if(!!this.componentName){
            this.componentFactory=this._componentFactoryResolver.resolveComponentFactory(this.componentName);
        }else{
            throw new Error('if you set the contentType equal to "component",you must set component! ');
        }
     

    }
    ngOnChanges(changes:any) {
        this.bindInputs(); 
    }

    bindInputs(){
        
        if(!!this.componentInputs && !!this.componentRef){
            //绑定输入
            let inputs=this.componentFactory.inputs;
            inputs.forEach((input)=>{
                    switch(input.templateName) {
                        case 'currentRowData':
                            this.componentRef.instance[input.propName]=this.currentRowData;
                            break;
                        case 'currentColConfig':
                            this.componentRef.instance[input.propName]=this.currentColConfig;
                            break;
                    default:
                            if(this.componentInputs.hasOwnProperty(input.templateName)) {
                                let inputValue=this.componentInputs[input.templateName];
                                // 当自定义组件中需要绑定当前行数据中的某个字段
                                if(typeof(inputValue)==='string'&& inputValue.indexOf('BIND_IN_ROWDATA:')==0){
                                    let key=inputValue.split(':')[1].trim();
                                
                                    this.componentRef.instance[input.propName]=this.currentRowData[key];
                                }else{
                                    this.componentRef.instance[input.propName]=inputValue;
                                }
                            
                            }
                    }
            })
        }
    }


    bindOutpus(){
        if(!!this.componentOutputs) {
            // 绑定输出 
            if(!!this.componentRef && !!this.componentFactory){
                let outputs=this.componentFactory.outputs;
                outputs.forEach(output => {
                    if(this.componentOutputs.hasOwnProperty(output.templateName)) {
                        this.componentRef.instance[output.propName].subscribe(this.componentOutputs[output.templateName]);
                    }
                });
            }else{
                throw new Error('componentRef or componentFactory is not exit!');
            }

        }
    }

    public ngAfterViewInit() {
        if(!this.componentRef) {
            this.componentRef = this.vc.createComponent(this.componentFactory, 0, this._injector);    
        }
        this.bindInputs();
        this.bindOutpus();
        this.cdr.detectChanges();
    }

}
