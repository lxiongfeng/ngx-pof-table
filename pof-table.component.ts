import {
    Component,
    OnInit,
    Input,
    ViewEncapsulation,
    ChangeDetectorRef,
    Output, ElementRef,
    EventEmitter, Injector, ViewContainerRef, ViewChildren, AfterViewInit, ViewChild, HostListener
} from '@angular/core';

import { FiltersArrayItem, FilterConfsItem, SortItem } from './classes/until.interface';
import { LocalSorter } from './classes/local-sort.class';
import { LocalFilter } from "./classes/local-filter.class";
import { ViewContainerService } from "./classes/plx-table-viewContainer.service";
import { PlxTableI18nService } from "./classes/plx-table-i18n.service";
import { PlxI18nService } from "../plx-i18n/plx-i18n.service";
import { Subject, Observable } from 'rxjs';

@Component({
    selector: 'plx-table',
    encapsulation: ViewEncapsulation.None,
    templateUrl: 'plx-table.component.html',
    styleUrls: ['plx-table.component.less'],
    providers: [ViewContainerService, PlxTableI18nService]
})
export class PlxTableComponent implements OnInit, AfterViewInit {

    @ViewChildren('trVcRef', { read: ViewContainerRef }) public trViewContainRefList: any;
    @ViewChild('srcollhead') public srcollHeadElement: any;
    @ViewChild('srcollbody') public srcollBodyElement: any;

    _trHeight: number = 40;

    _tableTypeClass: string = 'plx-table-normal';

    @Input()   // 根据类型设置表格单元格高度
    set tableType(type: string) {
        let typeClass = {};
        switch (type) {
            case 'sm':
                this._trHeight = 30;
                this._tableTypeClass = 'plx-table-sm';
                break;
            case 'large':
                this._trHeight = 50;
                this._tableTypeClass = 'plx-table-large';
                break;
            case 'card':
                this._trHeight = 64;
                this._tableTypeClass = 'plx-table-card';
                break;
            default:
                break;
        }
    }
    get tableType() {
        return this._tableTypeClass;
    }

    // 是否显示详情列
    @Input()
    set showRowDropdown(value: boolean) {
        this._showRowDropdown = value;
        if (this.isInit) {
            this.updateDisplayCols();
        }
    }
    get showRowDropdown() {
        return this._showRowDropdown;
    }

    // 是否显示checkbox
    @Input()
    set showCheckBox(value: boolean) {
        this._showCheckBox = value;
        if (this.isInit) {
            this.updateDisplayCols();
        }
    }
    get showCheckBox() {
        return this._showCheckBox;
    }
    // checkbox 选中模式，分为单选与多选 single | multi
    @Input() checkModel: string = "single";
    // 是否显示序号列
    @Input()
    set showIndexColumn(value: boolean) {
        this._showIndexColumn = value;
        if (this.isInit) {
            this.updateDisplayCols();
        }
    }
    get showIndexColumn() {
        return this._showIndexColumn;
    }
    // 是否在客户端进行数据的 过滤，排序，分页
    @Input() isPrepareDataOnLocal: boolean = true;
    // 分页大小可选项
    @Input() pageSizeSelections: Array<any> = [5, 10, 15, 20];
    // 设置是否显示表格头
    @Input() showTableHead: boolean = true;
    // 设置是否显示分页
    @Input() showPagination: boolean = true;
    // 设置是否显示加载中动画
    @Input() showLoading: boolean;
    // 设置是否显示全局过滤搜索框
    @Input() showGlobalFilter: boolean = true;
    // 设置是否显示列定制
    @Input() showCustomCol: boolean = true;
    // 设置是否出表格滚动条
    @Input() scroll: any = false;
    // 设置是否显示表格列输入搜索开关
    @Input() showColFilterToggle: boolean = true;
    // 展示无数据
    @Input() showNoDataMessage: boolean = true;
    // 展示无数据的提示
    @Input() noDataMessage: string;
    // 全局搜索提示信息
    @Input() globalFilterPlaceholder: string = '';
    // 加载中提示信息
    @Input() loadingPlaceholder: string;
    // 设置是否滚动优化,横向滚动
    @Input() optimizScrollOnX: boolean = false;
    // 设置是否滚动优化,纵向滚动
    @Input() optimizScrollOnY: boolean = false;
    // 设置是否及时搜索
    @Input() searchInstant: boolean = true;
    // disabled 
    @Input() disabled: boolean ;
    // 国际化语言设置
    @Input()
    set language(language: string) {
        this._language = language;
        if (this.isInit) {
            this.plxTableI18nService.setI18n(this._language);
        }

    }

    get language(): string {
        return this._language;
    }

    // 设置列定制勾选面板的最大高度
    @Input() colsPanelMaxHeight: string = '240px';
    // 列定制信息发生改变时的回调
    @Input() customColsCallback: any;
    // 表格列属性
    @Input()
    set columns(value) {
        this._columns = value;   
        // 列配置更新后，过滤、排序配置也得到更新，因此重新触发过滤、排序
        if (this.isInit ) {
            // 把要显示的列放进cols中，把过滤、排序配置取出来
            this.updateCols();
            if (this.isPrepareDataOnLocal){
                this.prepareData();
            }
           
           
        }
    };

    get columns() {
        return this._columns;
    }

    // 表格数据总条数
    @Input()
    set total(value: number) {
        // 只有当非本地分页处理时，设置total才生效
        if (!this.isPrepareDataOnLocal) {
            this._total = value;
            if (this.isInit) {
                this.correctPageInfo();
                // this.emitPageInfoChange();
            }
        }
    }

    get total() {
        return this._total;
    }

    // 设置分页大小
    @Input()
    set pageSize(value) {
        this._pageSize = value;
        if (this.isInit) {
            // 如果为本地分页，则还需要重新分页
            if (this.isPrepareDataOnLocal) {
                this.prepareData();
            }
            // this.emitPageInfoChange();
        }
    }

    get pageSize() {
        return this._pageSize;
    }

    // 滚动优化后的数据
    _optimizedScrollData: Array<any>;
    // 表格输入数据
    @Input()
    set data(value) {
        this._data = value;
        this._preparedData = this._data;
        this._optimizedScrollData=this._preparedData;
        // ngOnInit 方法已经调用过
        if (this.isInit) {
            // 本地分页、过滤、排序
            if (this.isPrepareDataOnLocal) {
                this.prepareData();
            } else {
                this.correctPageInfo();
            }
            // 纵向滚动优化
            if (this.optimizScrollOnY ) {
                this.adjustDataAndOccupation()
            } 
        }
    }

    get data() {
        let data:Array<any>;
        /**
         * 如进行本地数据处理，则_preparedData 为原始数据_data的子集, 
         * 如进行滚动优化，则_optimizedScrollData 为 _preparedData 的子集
         * 否则这三者相等
         */
        if(this.optimizScrollOnY){
            data=this._optimizedScrollData;
        }else{
            data = this._preparedData;
        }
        // 当获取到的数据为空时，根据配置项 showNoDataMessage 来决定是否显示无数据提示。
        if (this.showNoDataMessage) {
            this._showNoDataMessage = data.length === 0 ? true : false;
        }
        return data;
    }

    // 设置当前页
    @Input()
    set pageIndex(value: any) {
        if (this.isInit) {
            if (value > this._maxPageIndex) {
                value = this._maxPageIndex;
            }
            this._pageIndex = value;
            // 如果为本地分页，则还需要重新分页
            if (this.isPrepareDataOnLocal) {
                this.prepareData();
            }

        } else {
            this._pageIndex = value;
        }
    }

    get pageIndex() {
        return this._pageSize;
    }

    @Input() dropDownTitleWidth: string = '20%';

    @Input() showGlobleFilterTip: boolean = false;

    @Output() pageInfoChange: EventEmitter<any> = new EventEmitter<any>();

    @Output() checkboxInfoChange: EventEmitter<any> = new EventEmitter<any>();

    @Output() filterInfoChange: EventEmitter<any> = new EventEmitter<any>();

    @Output() sortInfoChange: EventEmitter<any> = new EventEmitter<any>();

    // 是否显示详情列
    _showRowDropdown: boolean = false;
    // 是否显示checkbox
    _showCheckBox: boolean = false;
    // 是否显示序号列
    _showIndexColumn: boolean = false;
    //  showNoDataMessage 为true时，根据
    _showNoDataMessage: boolean = false;
    //国际化信息
    _language: string;
    // _columns包含所有列信息，包括要显示的列隐藏的列
    _columns: Array<any>;
    // cols 仅包含要显示的列
    cols: Array<any>;
    // 分页，过滤，排序后的数据
    _preparedData: Array<any>;
    // 输入的数据
    _data: Array<any>;
    // 页码
    _pageIndex: number = 1;
    // 当前页显示的条数
    _pageSize: number;
    // 总条数，当本地数据时，总数由过滤后的数据条数决定
    _total: number;
    // 最大页数
    _maxPageIndex: number = 1;
    // 标志组件是否初始化过
    isInit: boolean = false;
    // 排序参数
    sortConf: SortItem;
    // 过滤参数
    filterConfs: Array<FilterConfsItem> = [];
    // 已经勾选的 列过滤选项
    checkedFilterConfs: Array<FilterConfsItem>;
    // 标记是否为全局过滤
    _isGlobalFilter: boolean = false;
    // 标记上次点击的行，shift做多行连选
    _lastCheckedIndex: number = 0;
    // 标记上次的选中是否是按下shift键
    _isLastCheckWithShift: boolean = false;
    // 全局搜索串
    globalFilterKey: string = '';

    showColFilter: boolean = false;

    colFilterConf: Array<any> = [];

    allCheckStatus: boolean = false;

    rowDetailI18n: string;

    rowIndexI18n: string;
    // 当前显示列的数量
    displayedCols: number;
    // 存储含有format的列
    formatCols: Map<string, any>;
    // 纵向滚动视口区可容纳的元素个数
    _rowNumInViewPort: number;
    // 横向滚动视口区可容纳的列
    _optimizedScrollCols:Array<any>;
    // 纵向滚动截取data的index
    _sliceIndex: number = 0;
    // 纵向滚动位置
    _scrollTop:number = 0;
    // 横向视口宽度
    _viewPortWidth:number;
    // 横向滚动宽度
    _scrollLeft:number=0;
    // 是否有足够列供横向滚动优化
    _isEnoughCols:boolean=false;
    // 横向滚动起始点
    _scrollXStart:number=0;
    // 横向滚动结束点
    _scrollXEnd:number=0; 
    // 横向滚动起始点偏移量
    _XStartOffset:number=0;
    // 横向滚动结束点偏移量
    _XEndOffset:number=0;
    _XLeftOccupy:number=0;
    _XRightOccupy:number=0;
    // 标记是否需要重新调整占位，当列发生变化时置为true
    _neededRecaculate:boolean=false;
    // showGlobleFilterTip=true时，全局提示的placeholder
    globleFilterTip: string;
    // globleFilterTip中列名之间的分隔符
    globleFilterTipSeparator: string;
    // 存储列的 nativeElement
    colsNativeElement:any=[];


    colFilterToggle(value: boolean) {
        this.showColFilter = value;
        // 当单列搜索关闭时，清空搜索项
        if (this.showColFilter === false) {
            this.colFilterConf = [];
            if (this.isPrepareDataOnLocal) {
                this.prepareData();
            }
            // this.emitCheckedInfoChange();
        }
    }

    constructor(private cd: ChangeDetectorRef, private viewContainerService: ViewContainerService,
        private tableInject: Injector, private plxTableI18nService: PlxTableI18nService,
        private plxI18nService: PlxI18nService, private _elementRef: ElementRef) {

        this.windowResizeObservable =this.windowResizeSubject.asObservable()
    }

    ngOnInit() {
        this.plxTableI18nService.setI18n(this._language);
        this.globleFilterTipSeparator = this.plxTableI18nService.getI18n('globleFilterTipSeparator');

        if(this.noDataMessage === undefined) {
            this.noDataMessage = this.plxTableI18nService.getI18n('noData');
        }
        if(this.loadingPlaceholder === undefined) {
            this.loadingPlaceholder = this.plxTableI18nService.getI18n('loading');
        }

        this.rowDetailI18n = this.plxTableI18nService.getI18n('rowDetail');
        this.rowIndexI18n = this.plxTableI18nService.getI18n('rowIndex');
        if (isNaN(this._pageSize)) {
            this._pageSize = this.pageSizeSelections[0];
        }
        // 获取横向滚动视口宽度
        if (this.optimizScrollOnX) {
            this._viewPortWidth = this._elementRef.nativeElement.children[0].offsetWidth;
            if(this.showCheckBox){
                this._viewPortWidth-=41;
            }
            if(this.showRowDropdown){
                this._viewPortWidth-=60;
            }
            if(this.showIndexColumn){
                this._viewPortWidth-=51;
            }
        }
        // 初始化更新列
        this.updateCols();

        if (this.isPrepareDataOnLocal) {
            this.prepareData(); //本地数据处理
        } else {
            this.correctPageInfo(); // 非全量本地数据，根据总数计算最大页
        }
      
        // 纵向滚动优化
        if (this.optimizScrollOnY ) {
            // 计算纵向视口可容纳的元素
            this.caculateViewPortCapacityOnY();
            this.adjustDataAndOccupation()
        } 
       
 
        this.isInit = true;  // 初始化标志置为true
    }

    public ngAfterViewInit() {
        // angular 4.0.3版本在 ngAfterViewInit加载时会 emit，4.2.3版本则不会，这里做兼容处理
        if (this.trViewContainRefList._results) {
            this.viewContainerService.setViewContainersList(this.trViewContainRefList._results);
        }
        // 对视图变化做监听
        this.trViewContainRefList.changes.subscribe((item: any) => {
            this.viewContainerService.setViewContainersList(item._results);
        });

         // 纵向滚动优化
        if (this.optimizScrollOnY ) {
            this.adjustDataAndOccupation()
        } 
    }

    ngOnDestroy(): void {
       if(this.hasBindedMouseEvent) {
           window.document.removeEventListener('mousemove', this.bindedMouseMoveFunc);
           window.document.removeEventListener('mouseup', this.bindedMouseUpFunc);
       }
    }

    stopPropagation(event) {
        event.stopPropagation();

    }

    format(row, col) {
        if (!!col.format) {
            return col.format(row[col.key]);
        } else {
            return row[col.key];
        }
    }
    // 行点击事件回调
    trClick(event, row, rowIndex) {
        let checkedArray = [];
        // 应用自定义的组件中包含 polyline 等 svg 的标签没有includes方法
        if (!event.target.className.includes) {
            return;
        }
        // 当被点击的目标元素中不包含指定的class时，则无需响应该点击
        if (!event.target.className.includes('plx-table-valid-elemt')) {
            if (event.target.className.includes('checkbox-substitute') && event.shiftKey) {
                // do nothing, continue;
            } else {
                return;
            }
        }
        if (this.checkModel === 'multi') {
            if (event.shiftKey) { // 按下shiftKey
                let start, end;
                let checkedData = [];
                let uncheckedData = [];
                this._lastCheckedIndex >= rowIndex ? (start = rowIndex, end = this._lastCheckedIndex) : (start = this._lastCheckedIndex, end = rowIndex);
                this._isLastCheckWithShift = true;
                // 选中上次点击与按住shift点击区间内的元素，取消区间外的元素
                for (let index = 0; index < this._preparedData.length; index++) {
                    if (index < start || index > end) {
                        if (this._preparedData[index]['isChecked']) {
                            this._preparedData[index]['isChecked'] = false;
                            uncheckedData.push(this._preparedData[index]);
                        }

                    } else {
                        if (this._preparedData[index]['isChecked'] != true) {
                            this._preparedData[index]['isChecked'] = true;
                            checkedData.push(this._preparedData[index]);
                        }
                    }
                }
                if (checkedData.length > 0) {
                    this.checkboxInfoChange.emit({
                        action: 'check',
                        actionData: checkedData,
                        currentPageChecked: checkedData
                    });
                }

                if (uncheckedData.length > 0) {
                    this.checkboxInfoChange.emit({
                        action: 'uncheck',
                        actionData: uncheckedData,
                        currentPageChecked: checkedData
                    });
                }

            } else { // 没有按下shiftKey

                row['isChecked'] = !row['isChecked'];
                if (!!row['isChecked']) {
                    this._lastCheckedIndex = rowIndex;

                }
                this._preparedData.forEach((item) => {
                    if (item.isChecked) {
                        checkedArray.push(item);
                    }
                });
                this.checkboxInfoChange.emit({
                    action: row['isChecked'] ? 'check' : 'uncheck',
                    actionData: [row],
                    currentPageChecked: checkedArray
                });
            }

        } else {
            if (!row['isChecked']) {// 选中某个节点，需要检查并反选还有其他选中节点
                this._preparedData.forEach((item) => {
                    if (item['isChecked']) {
                        item['isChecked'] = false;
                        this.checkboxInfoChange.emit({
                            action: 'uncheck',
                            actionData: [item]
                        });
                    }

                });
                row['isChecked'] = !row['isChecked'];
                this.checkboxInfoChange.emit({
                    action: 'check',
                    actionData: [row],
                    currentPageChecked: [row]
                });

            } else {// 取消选中
                row['isChecked'] = !row['isChecked'];
                this.checkboxInfoChange.emit({
                    action: 'uncheck',
                    actionData: [row],
                    currentPageChecked: []
                });
            }

        }

    }


    // checkbox点击的回调
    checkBoxClick(event, row, rowIndex) {
        event.stopPropagation();
        this.trClick(event, row, rowIndex);
    }


    // 点击全选
    allCheckStatusChange(event) {
        let temp = [];
        this.allCheckStatus = event;
        this._preparedData.forEach((item) => {
            if (item['isChecked'] !== event) {
                temp.push(item);
            }
            item['isChecked'] = event;
        });
        if (event) {
            this.checkboxInfoChange.emit({
                action: event ? 'check' : 'uncheck',
                actionData: temp,
                currentPageChecked: this._preparedData
            });
        } else {
            this.checkboxInfoChange.emit({
                action: event ? 'check' : 'uncheck',
                actionData: temp,
                currentPageChecked: []
            });
        }
    }
    // 检查全选框状态---该方法调用过于频繁，可尝试用管道啥的来优化
    checkIsAllChecked() {
        let allChecked = true;
        this._preparedData.forEach((item) => {
            if (item.isChecked === false || typeof (item.isChecked) === 'undefined' || item.isChecked === null) {
                allChecked = false
            }
        });
        if (this._preparedData.length === 0) {
            allChecked = false;
        }
        return allChecked;
    }

    // 将columns中要显示的列更新到Cols中
    updateCols() {
        this.cols = [];
        this.filterConfs = [];
        this.formatCols = new Map();
        this.hasResizableCol=false;
        let sortConf = new SortItem();
        // TODO:应该只对显示的列进行排序，避免逻辑问题
        this._columns.forEach((item) => {
            //非显示的列也可排序
            if (item.sort && (!sortConf['key'] || sortConf['sortDirection'] ==='none' )) {
                sortConf.key = item.key;
                sortConf.sortDirection = item.sort;
                sortConf.sortFunc = item.sortFunction;
            }
            // 标记所有列中是否有可调整宽度的列
            if (!!item.resizable){
                this.hasResizableCol=true;
            }

            if (!!item.format) {
                this.formatCols.set(item.key, item.format);
            }
            if (item.show !== false) {
                item.show = true; // 默认值置为true
                this.cols.push(item);

                if (!!item.filterArray && (item.filterArray instanceof Array) && item.filterArray.length !== 0) {
                    this.addFilterConf({
                        key: item.key,
                        filters: item.filterArray,
                        filterFunc: item.filterFunc
                    })
                }
            }
        });
        // 横向滚动优化
        if (this.optimizScrollOnX ) {
            this.adjustCols(true,this._scrollLeft);
        }else {
            this._optimizedScrollCols=this.cols;
            // 更新列的同时，计算出当前所显示列的总数，为colspan设置一个较大值在有些版本的浏览器会出滚动条
            this.displayedCols=this._optimizedScrollCols.length;
            this.updateDisplayCols();
        }
        // sortConf 有变动时向外
        if(!this.sortConf || (this.sortConf.key !== sortConf.key && this.sortConf.sortDirection !== sortConf.sortDirection) ){
            this.sortConf = sortConf;
            this.emitSortInfoChange();
        }
        // 每次列更新后，获取到当前显示的最后一列的 key，表格调整列宽需要获取到最后一列的key;
        let length = this._optimizedScrollCols.length;
        if(length > 0) {
            this.lastColKey = this._optimizedScrollCols[length-1].key;
        }
        // 含有可调整宽度的列
        if (this.hasResizableCol) {
            if (!this.hasBindedMouseEvent){
                window.document.addEventListener('mousemove', this.bindedMouseMoveFunc);
                window.document.addEventListener('mouseup', this.bindedMouseUpFunc);
                this.hasBindedMouseEvent = true;
            }
        //不含有可调整列宽的列 
        }else {
            if (this.hasBindedMouseEvent) {
                window.document.removeEventListener('mousemove', this.bindedMouseMoveFunc);
                window.document.removeEventListener('mouseup', this.bindedMouseUpFunc);
                this.hasBindedMouseEvent = false;
            }
        }
        
        // 显示全局搜索提示信息时，获取全局搜索的列组成的提示信息
        this.getGlobleFilterTip();
    }

    private getGlobleFilterTip(): void {
        if (this.showGlobleFilterTip) {
            let tmpFilterArray = [];
            this.cols.forEach((col) => {
                if (col.filter && col.show) {
                    tmpFilterArray.push(col.title);
                }
            });
            if (tmpFilterArray && tmpFilterArray.length>0) {
                this.globleFilterTip = tmpFilterArray.join(this.globleFilterTipSeparator);
            } else {
                this.globleFilterTip = '';
            }
        }
    }

    // 更新当前显示列数
    updateDisplayCols() {
        if (this._showCheckBox) {
            this.displayedCols++;
        }

        if (this._showIndexColumn) {
            this.displayedCols++;
        }

        if (this._showRowDropdown) {
            this.displayedCols++;
        }
    }

    // 勾选项过滤设置，列配置信息columns发生变动时调用
    addFilterConf(filterConf: FilterConfsItem) {
        this.filterConfs.push(filterConf);
    }
    // 更新选择过滤项，列过滤选项更新时调用
    updateFilterConf(filterConf: FilterConfsItem) {
        let itemIndex = -1;

        this.filterConfs.forEach((conf: FilterConfsItem, index: number) => {
            if (conf.key === filterConf.key) {
                itemIndex = index;
            }
        });
        // finded it
        if (itemIndex > -1) {
            this.filterConfs[itemIndex].filters = filterConf.filters;
            this.filterConfs[itemIndex].filterFunc = filterConf.filterFunc;
        } else {
            this.filterConfs.push(filterConf);
        }


    }
    // 列输入过滤设置
    setColFilterConf(value) {
        let notFinded = true;
        this.colFilterConf.forEach((item) => {
            if (value.key === item.key) {
                notFinded = false;
                item.filterKey = value.filterKey;
            }
        });
        if (notFinded) {
            this.colFilterConf.push(value);
        }

    }

    setSortConf(key: string, sortDirection: string, sortFunc) {
        this.sortConf.key = key;
        this.sortConf.sortDirection = sortDirection;
        this.sortConf.sortFunc = sortFunc;
    }

    // 过滤
    filter() {
        this.selectionsFilter();
        this.columnFilter();
        this.globalFilter();
    }


    // 针对列的筛选
    selectionsFilter() {
        this.checkedFilterConfs = [];
        let temData = this._data;
        // 遍历 filterConfs
        this.filterConfs.forEach((filterConf: FilterConfsItem) => {
            let mergedData: Array<any> = [];
            let hasFilterCol = false;
            let checkedItemArray = [];
            // 遍历 filters
            filterConf.filters.forEach((filterItem: FiltersArrayItem) => {
                if (filterItem.checked) {
                    checkedItemArray.push(filterItem);
                    hasFilterCol = true;
                    mergedData = mergedData.concat(LocalFilter
                        .filter(temData, filterConf.key, filterItem.filterKey, this.formatCols, filterConf.filterFunc));
                }
            });
            // 如果filterConf.filters有勾选中的项，则将勾选中置于checkedFilterConfs中
            if (checkedItemArray.length > 0) {
                this.checkedFilterConfs.push({
                    key: filterConf.key,
                    filters: checkedItemArray,
                    filterFunc: filterConf.filterFunc
                })
            }
            if (hasFilterCol) {
                temData = mergedData.filter((elem, pos, arr) => {
                    return arr.indexOf(elem) === pos;
                });
            }

        });

        this._preparedData = temData;

    }


    columnFilter() {
        this.colFilterConf.forEach((item) => {
            this._preparedData = LocalFilter.filter(this._preparedData, item.key, item.filterKey, this.formatCols, item.filterFunc);
        });
    }

    // 全局筛选
    globalFilter() {
        let mergedData: Array<any> = [];
        let hasFilterCol = false;
        this.cols.forEach((item) => {
            if (item.filter) {
                hasFilterCol = true;
                mergedData = mergedData.concat(LocalFilter
                    .filter(this._preparedData, item.key, this.globalFilterKey, this.formatCols, item.filterFunc));
            }
        });
        if (hasFilterCol) {
            // 移除重复的元素
            this._preparedData = mergedData.filter((elem, pos, arr) => {
                return arr.indexOf(elem) === pos;
            });
        }

    }

    // 排序
    sort() {
        if (!!this.sortConf && !!this.sortConf.sortDirection && this.sortConf.sortDirection !== 'none') {
            this._preparedData = LocalSorter
                .sort(this._preparedData, this.sortConf.key, this.sortConf.sortDirection, this.sortConf.sortFunc).slice();
        }

    }

    // 分页
    paginage() {
        if (isNaN(this._pageSize)) {
            this._pageSize = this.pageSizeSelections[0];
        }
        this._preparedData = this._preparedData.slice((this._pageIndex - 1) * this._pageSize, this._pageIndex * this._pageSize);
    }

    // 本地数据的处理，先后包含三个部分：过滤、排序、分页
    prepareData() {
        this.filter();
        this.sort();
        if (this.showPagination) {
            this.correctPageInfo();
            this.paginage();
        }
    }

    clolumsChangeFromView(newColumns) {
        // need confirm
        if (!!this.customColsCallback) {
            // callback the input function
            let resultPromise = this.customColsCallback(newColumns);
            this.showLoading = true;
            resultPromise.then((result) => {
                if (result) {
                    this.updateCustomColsSetting(newColumns);
                    this.showLoading = false;
                } else {
                    this.showLoading = false;
                    return; // do nothing, no update columns settings
                }
            });
            // no need confirm
        } else {
            this.updateCustomColsSetting(newColumns);
        }

    }

    updateCustomColsSetting(newColumns) {
        this._columns = newColumns;
        this.updateCols();
        // 
        if (this.isPrepareDataOnLocal) {
            this.prepareData();
        }
    }

    globalFiltInfoChangeFromView(filterString: string) {
        this.globalFilterKey = filterString;
        if (this.isPrepareDataOnLocal) {
            this.prepareData();
        }
         // 纵向滚动优化
        if (this.optimizScrollOnY ) {
            this.adjustDataAndOccupation()
        } 
        this.emitFilterInfoChange();
    }

    columnFilterInfoChangeFromView(value) {
        this.setColFilterConf(value);
        if (this.isPrepareDataOnLocal) {
            this.prepareData();
        }
         // 纵向滚动优化
        if (this.optimizScrollOnY ) {
            this.adjustDataAndOccupation()
        } 
        this.emitFilterInfoChange();
    }

    columnSelectionFiltInfoChangeFromView(value) {
        if (!!value) {
            this.updateFilterConf(value);
        }
        if (this.isPrepareDataOnLocal) {
            //本地数据处理，同时更新checkedFilterConfs
            this.prepareData();
        } else {
            // 将选项中当前勾选中的更新到 checkedFilterConfs 中
            this.checkedFilterConfs = [];
            this.filterConfs.forEach((filterConf: FilterConfsItem) => {
                let tempFilters: Array<FiltersArrayItem> = [];
                filterConf.filters.forEach((filterItem: FiltersArrayItem) => {
                    if (filterItem.checked) {
                        tempFilters.push(filterItem);
                    }
                });
                if (tempFilters.length > 0) {
                    this.checkedFilterConfs.push({
                        key: filterConf.key,
                        filters: tempFilters,
                        filterFunc: filterConf.filterFunc
                    })
                }
            });
        }
     
         // 纵向滚动优化
        if (this.optimizScrollOnY ) {
            this.adjustDataAndOccupation()
        } 
        this.emitFilterInfoChange();
    }

    sortInfoChangeFromView(info) {
        // 用来标记当前排序中是否存在
        let flag = false;
        this.setSortConf(info.key, info.sortDirection, info.sortFunc);

        if (this.isPrepareDataOnLocal) {
            this.prepareData();
        }
        // 根据当前数据量判断是否有必要做滚动优化
        if (this.optimizScrollOnY ) {
            this.adjustDataAndOccupation()
        } 
        this.emitSortInfoChange();
    }

    pageInfoChangeFromView(info) {
        this._pageIndex = info.pageIndex;
        this._pageSize = info.pageSize;
        if (this.isPrepareDataOnLocal) {
            this.prepareData();
        } else {
            this.correctPageInfo();
        }
        // 根据当前数据量判断是否有必要做滚动优化
        if (this.optimizScrollOnY ) {
            this.adjustDataAndOccupation()
        } 
        this.emitPageInfoChange();
    }

    emitPageInfoChange() {
        this.pageInfoChange.emit({
            pageSize: this._pageSize,
            pageIndex: this._pageIndex,
            maxPageIndex: this._maxPageIndex
        });
        // if (this.showCheckBox) {
        //     this.emitCheckedInfoChange();
        // }

    }

    emitFilterInfoChange() {
        this.filterInfoChange.emit({
            singleColFilters: this.colFilterConf,
            selectionFilters: this.checkedFilterConfs,
            globalFilterString: this.globalFilterKey
        });

        // if (this.showCheckBox) {
        //     this.emitCheckedInfoChange();
        // }
    }

    emitSortInfoChange() {
        this.sortInfoChange.emit([this.sortConf]);
        // if (this.showCheckBox) {
        //     this.emitCheckedInfoChange();
        // }
    }

    // 对输入的分页信息进行校正
    correctPageInfo() {
        if (this.isPrepareDataOnLocal) {
            this._total = this._preparedData.length;
        } else if (isNaN(this._total)) {
            throw new Error('isPrepareDataOnLocal 置为 false时，需要指定数据总数 total');
        }
        if (isNaN(this._pageSize)) {
            this._pageSize = this.pageSizeSelections[0];
        }
        this._maxPageIndex = Math.ceil(this._total / this._pageSize);
        if (this._maxPageIndex === 0) {
            this._maxPageIndex = 1;
        }
        if (this._pageIndex > this._maxPageIndex) {
            this._pageIndex = this._maxPageIndex
        }
        if (this._maxPageIndex > 0 && this._pageIndex <= 0) {
            this._pageIndex = 1;
        }

    }


    scrollOnX(event) {

        if (!!this.srcollHeadElement && !!this.srcollBodyElement) {
            this.srcollHeadElement.nativeElement.scrollLeft = this.srcollBodyElement.nativeElement.scrollLeft;
            let scroller = this.srcollBodyElement.nativeElement;
            let scrollTop = scroller.scrollTop;
            let scrollLeft = scroller.scrollLeft;
            // 纵向滚动优化
            if (this.optimizScrollOnY && this._scrollTop !== scrollTop ){
                this.adjustDataAndOccupation();
            }
            if (this.optimizScrollOnX && this._scrollLeft != scrollLeft  ){
                this.adjustCols(false || this._neededRecaculate, scrollLeft);
                this._scrollLeft = scrollLeft;
            }

        }
    }
    /**
     * resize后，重新调整视口
     */
    @HostListener('window:resize', ['$event'])
    resizeOnScrollBody(event) {
        if (this.optimizScrollOnX && this._elementRef.nativeElement.children[0].offsetWidth > 0
            && this._elementRef.nativeElement.children[0].offsetWidth!=this._viewPortWidth) {
            this._viewPortWidth = this._elementRef.nativeElement.children[0].offsetWidth;
            this.adjustCols(true,this._scrollLeft);
        }
        if (this.hasResizableCol){
            this.windowResizeSubject.next('resize');
        }
        
    }

    adjustCols(recaculate:boolean,scrollLeft:number) {
        this._optimizedScrollCols = [];
        let delta ;
        let occuptWidthLeft = 0;
        let occupyWidthRight = 0;
        // 重新计算起始终止位置，仅当列更新时需要
        if(recaculate){
            delta = scrollLeft;
            this._scrollXStart=0;
            // 计算左边占位宽度
            for (let i = 0; i < this.cols.length; i++) {
                if (isNaN(Number.parseInt(this.cols[i].width))) {
                    throw new Error('设置横向滚动优化需要设置每列的宽度');
                }
                let colWidth = Number.parseInt(this.cols[i].width);
                if (delta > colWidth) {
                    delta -= colWidth;
                    this._scrollXStart++;
                } else {
                    break;
                }
            }
            this._XStartOffset = delta;
            occuptWidthLeft = scrollLeft-delta ;
            // 计算 _scrollXEnd
            let viewPortRemain = this._viewPortWidth + delta;
            for (this._scrollXEnd = this._scrollXStart; this._scrollXEnd <this.cols.length; this._scrollXEnd++) {
                if (isNaN(Number.parseInt(this.cols[this._scrollXEnd].width))) {
                    throw new Error('设置横向滚动优化需要设置每列的宽度');
                }
                if (viewPortRemain > 0) {
                    viewPortRemain -= Number.parseInt(this.cols[this._scrollXEnd].width);
                } else {
                    break;
                }
            }
            // 视口足够容纳剩余的所有元素,直接将_XEndOffset置为0,会导致内容滚动，重新
            // 触发 scroll事件,需要在被调用的scroll事件中重新调整；
            if (viewPortRemain>=0){
                this._XEndOffset=0;
                this._neededRecaculate = true;
            }else{
                this._XEndOffset = Math.abs(viewPortRemain);
                this._neededRecaculate=false;
            }
          
            // 计算右边占位宽度
            for (let j = this._scrollXEnd; j < this.cols.length; j++) {
                if (isNaN(Number.parseInt(this.cols[this._scrollXEnd].width))) {
                    throw new Error('设置横向滚动优化需要设置每列的宽度');
                }
                occupyWidthRight += Number.parseInt(this.cols[j].width);
            }
            
        }else{// 仅仅在列滚动时，只需根据此次与上次滚动只差调整占位宽度
            delta = scrollLeft-this._scrollLeft;
            // 滚动条向右移动
            if(delta>0) {
                let startDelta = delta + this._XStartOffset;
                let endDelta=delta-this._XEndOffset;
                let start=this._scrollXStart;
                let end=this._scrollXEnd;
                // 计算 occuptWidthLeft
                let leftPassedWidth=0;
                for(;start<this.cols.length;start++) {
                    let wth = Number.parseInt(this.cols[start].width);
                    if (startDelta > wth ){
                        startDelta -= wth;
                        leftPassedWidth+=wth;
                    }else{
                        break;
                    }
                }
                this._XStartOffset = Math.abs(startDelta);
                occuptWidthLeft = this._XLeftOccupy + leftPassedWidth;
                this._scrollXStart=start;
              
                let rightPassedWidth=0;
                for (; end < this.cols.length; end++) {
                    if (endDelta > 0) {
                        endDelta -= Number.parseInt(this.cols[end].width);
                        rightPassedWidth += Number.parseInt(this.cols[end].width);
                    } else {
                        break;
                    }
                }
                 this._XEndOffset = Math.abs(endDelta);
                occupyWidthRight = this._XRightOccupy - rightPassedWidth;
                this._scrollXEnd=end;
                
            }else {
                delta=Math.abs(delta);
                let start = this._scrollXStart;
                let end = this._scrollXEnd;
                let startDelta = delta -this._XStartOffset;
                let endDelta = delta + this._XEndOffset;
                let leftPassedWidth = 0;
                if(startDelta>0) start-=1;
                for(;start>=0;start--){
                    let wth = Number.parseInt(this.cols[start].width);
                    if (startDelta > 0){
                        startDelta-=wth;
                        leftPassedWidth+=wth;
                    }else{
                        break;
                    }
                }
                if (leftPassedWidth>0) start+=1;
                this._XStartOffset = Math.abs(startDelta);
                occuptWidthLeft = this._XLeftOccupy - leftPassedWidth;
                this._scrollXStart=start;

                let rightPassedWidth = 0;
                end=end-1;
                for (; end > 0; end--) {
                    let wth = Number.parseInt(this.cols[end].width);
                    if (endDelta > wth) {
                        endDelta -=wth;
                        rightPassedWidth += wth;
                    } else {
                        break;
                    }
                }
                this._XEndOffset = Math.abs(endDelta);
                occupyWidthRight = this._XRightOccupy +rightPassedWidth;
                this._scrollXEnd = end+1;

            }

        }
 
     
        this._XLeftOccupy = occuptWidthLeft;
        this._XRightOccupy = occupyWidthRight;
        // 裁剪视口列
        this._optimizedScrollCols = this.cols.slice(this._scrollXStart, this._scrollXEnd);
        // 更新列的同时，计算出当前所显示列的总数，为colspan设置一个较大值在有些版本的浏览器会出滚动条
        this.displayedCols=this._optimizedScrollCols.length;
        this.updateDisplayCols();
        if (!!this.srcollHeadElement && !!this.srcollBodyElement) {
            if (this._isEnoughCols) {
                this.occupyWidth(occuptWidthLeft, occupyWidthRight);
            } else {
                // 改变列配置
                setTimeout(() => {
                    this.occupyWidth(occuptWidthLeft, occupyWidthRight);
                }, 0);

            }
        } else {
            // ngOnInit中视图还未加载完毕，延迟到视图加载后再设置占位宽度
            setTimeout(() => {
                this.occupyWidth(occuptWidthLeft, occupyWidthRight);
            }, 0);
        }
        // 
        if ((this._scrollXEnd - this._scrollXStart) < this.cols.length) {
            this._isEnoughCols = true;
        } else {
            this._isEnoughCols = false;
        }

    }
    /**
     * 设置左右占位的宽度
     * @param leftWidth 
     * @param rightWidth 
     */
    occupyWidth(leftWidth, rightWidth) {
        // _isEnoughCols为true时，表示占位元素在视图上是存在的
        if (this._isEnoughCols) {
            let headLeft = this.srcollHeadElement.nativeElement.querySelector('.plx-tb-occupy-head-left');
            let headRight = this.srcollHeadElement.nativeElement.querySelector('.plx-tb-occupy-head-right');

            let bodyLeft = this.srcollBodyElement.nativeElement.querySelector('.plx-tb-occupy-body-left');
            let bodyRight = this.srcollBodyElement.nativeElement.querySelector('.plx-tb-occupy-body-right');
            // th元素 宽度设置为 0px 在firefox下仍然占据空间
            if (leftWidth ===0 ){
                headLeft.style.width = '';
                bodyLeft.style.width = '';
            }else{
                headLeft.style.width = leftWidth + 'px';
                bodyLeft.style.width = leftWidth + 'px';
            }
            headRight.style.width = rightWidth + 'px';
            bodyRight.style.width = rightWidth + 'px';
        }
    }

    /**
     * 根据当前数据量和视口可容纳的数据 来判断是否需要做纵向滚动优化
     * @param { ratio: number } 比率
     * @return {:boolean} 
     */
    isEnoughData(ratio: number): boolean {
        
        return this._preparedData.length > this._rowNumInViewPort * ratio;
    }
    /**
     * 截取 _prePareData 中的数据,并调整占位元素高度
     */
    adjustDataAndOccupation(): void {
        if(this.isEnoughData(2)){
            this.adjustOccupyElementHeight(true);
            this._optimizedScrollData = this._preparedData.slice(this._sliceIndex, this._sliceIndex + this._rowNumInViewPort);
        }else{
            this._optimizedScrollData=this._preparedData;
            this._sliceIndex=0;
            this.adjustOccupyElementHeight(false);
        }

    }
    /**
     * 调整占位元素的高度
     * @param {adjust:boolean}： true 时，调整占位高度，false 时，清空占位 
     */
    adjustOccupyElementHeight(adjust:boolean) {
        if (!!this.srcollBodyElement){
            let header = this.srcollBodyElement.nativeElement.querySelector('.plx-tb-occupy-header');
            let footer = this.srcollBodyElement.nativeElement.querySelector('.plx-tb-occupy-footer');
            if (adjust) {
                this._scrollTop = this.srcollBodyElement.nativeElement.scrollTop;
                this._sliceIndex = Math.floor(this._scrollTop / this._trHeight);
                this._sliceIndex = Math.min(this._preparedData.length - this._rowNumInViewPort, this._sliceIndex);
                let delta = this._preparedData.length - this._rowNumInViewPort - this._sliceIndex;
                header.style.height = this._sliceIndex * this._trHeight + 'px';
                footer.style.height = (delta) * this._trHeight + 'px';
            } else {
                header.style.height = '0px';
                footer.style.height = '0px';
            }
        }
    }

    /**
     * 计算纵向滚动视口区所能容纳的行数量
     */
    caculateViewPortCapacityOnY(): void {
        if(this.optimizScrollOnY) {
            if (!this.scroll || !this.scroll.y) {
                throw new Error('滚动优化配置只在配置了表格纵向滚动时才有效');
            }
            let viewPortHeight = Number.parseInt(this.scroll.y);
            if (isNaN(viewPortHeight)) {
                throw new Error('scroll.y值无效');
            }
            // 缓冲数为 2
            this._rowNumInViewPort = Math.ceil(viewPortHeight / this._trHeight) + 2;
        }
    }
    // 列调整宽度相关
    
    isResizing:boolean=false;
    resizeStartPageX:number;
    resizeDelta:number;
    resizeColKey:string;
    resizingCol:any;
    resizingSiblingCol:any;
    resizingIndex:any;
    lastColKey:string;
    hasBindedMouseEvent:boolean=false;
    hasResizableCol:boolean=false;

    bindedMouseMoveFunc:any=this.mouseMove.bind(this);
    bindedMouseUpFunc:any=this.mouseUp.bind(this);

    windowResizeSubject = new Subject<any>();
    windowResizeObservable: Observable<any>;


    /**
     * 鼠标移动时，计算列调整的距离
     * @param event 
     */
    mouseMove(event) {
      if(this.isResizing){
          this.resizeDelta=event.pageX - this.resizeStartPageX;
          this.resizingSiblingCol = this._optimizedScrollCols[this.resizingIndex + 1];
          let leftColWidth = this.resizingCol.nativeElement.offsetWidth + this.resizeDelta;
          let rightColWidth = this.resizingSiblingCol.nativeElement.offsetWidth - this.resizeDelta;
          // 最小宽度
          let leftMinWidth = parseInt(this.resizingCol.minWidth) || 80;
          let rightMinWidth = parseInt(this.resizingSiblingCol.minWidth) || 80;
          let finalDelta;
          if (leftColWidth < leftMinWidth) {
              finalDelta = this.resizingCol.nativeElement.offsetWidth - leftMinWidth;
              this.resizeDelta = -finalDelta;
          }
          if (rightColWidth < rightMinWidth) {
              finalDelta = this.resizingSiblingCol.nativeElement.offsetWidth - rightMinWidth;
              this.resizeDelta = finalDelta;
          }
      }
    }
    /**
     * 鼠标左键按钮松开回调
     * @param event 
     */
    mouseUp(event) {
        if(this.isResizing) {
            try {
                this.isResizing = false;
                this.resizingCol.width = this.resizingCol.nativeElement.offsetWidth + this.resizeDelta + 'px';
                this.resizingSiblingCol.width = this.resizingSiblingCol.nativeElement.offsetWidth - this.resizeDelta+ 'px';
                setTimeout(() => {
                    this.windowResizeSubject.next('resize');
                }, 0);
               
            } catch (error) {
                console.log(error);
            }
        }
    }

    /**
     * 列宽度调整div 元素被点击时回调
     * @param event 
     */
    resizableColMouseDown(event) {
        this.isResizing=true;
        this.resizeStartPageX = event.startPageX;
        this.resizeColKey=event.colKey;
        this._optimizedScrollCols.forEach((item, index) => {
            if (this.resizeColKey === item.key) {
                this.resizingCol = item;
                this.resizingIndex = index;
            }
        });
    }
 
}
