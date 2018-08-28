import {NgModule, ModuleWithProviders}      from '@angular/core';
import {PlxTableComponent} from './plx-table.component';
import {PlxTablePaginationComponent} from './components/plx-table-pagination.component';
import {FormsModule} from '@angular/forms';
import {PlxTableSortComponent} from './components/plx-table-sort.component';
import {PlxTableFilterComponent} from './components/plx-table-filter.component';
import {PlxTableCustomColsComponent} from './components/plx-table-custom-cols.component';
import {PlxTableFilterSeclectComponent} from './components/plx-table-filter-seclect.component';
import {PlxTableCellComponent} from './components/plx-table-cell.component';
import {PlxTableService} from "./classes/plx-table.service";
import {ViewContainerService} from "./classes/plx-table-viewContainer.service";
import {PlxTableRowDropdownComponent} from './components/plx-table-row-dropdown.component';
import { PlxTableFilterColComponent } from './components/plx-table-filter-col.component';
import {CommonModule} from "@angular/common";
import { PlxLoadingModule } from '../plx-loading';
import { PlxTableCustomFilter } from './components/custom-colfilter.directive';
import {PlxTooltipModule} from "../plx-tooltip/plx-tooltip.module";
import { PlxPopoverModule } from '../plx-popover';
import { PlxTableFormat } from './components/plx-table-format.pipe';
import { PlxTableCaculateTopHeight } from './components/plx-table-caculate-topHeight.pipe';
import { PlxSearchModule } from '../plx-search/search.module';
import { PlxTableOverflow } from './components/plx-table-overflow.pipe';
import { PlxTableTdOverflow } from './components/plx-table-overflow.directive';
import { plxTableThMaxWidth } from './components/plx-table-th-max-width.pipe';
import { PlxTableCaculateColsWidth } from './components/plx-table-caculate-cols-width.directive';
import { PlxTableColResize } from "./components/plx-table-col-resize.directive";
import { PlxTableColResizableHandle } from './components/plx-table-col-resize.pipe';
export {PlxTableService} from "./classes/plx-table.service";
export {ViewContainerService} from "./classes/plx-table-viewContainer.service";

@NgModule({
    imports: [CommonModule,
             FormsModule, 
             PlxLoadingModule, 
             PlxTooltipModule,
             PlxPopoverModule,
             PlxSearchModule
            ],
    declarations: [
                    PlxTableComponent,
                    PlxTablePaginationComponent,
                    PlxTableSortComponent,
                    PlxTableFilterComponent,
                    PlxTableCustomColsComponent,
                    PlxTableFilterSeclectComponent,
                    PlxTableCellComponent,
                    PlxTableRowDropdownComponent,
                    PlxTableFilterColComponent,
                    PlxTableCustomFilter,
                    PlxTableFormat,
                    PlxTableCaculateTopHeight,
                    PlxTableOverflow,
                    PlxTableTdOverflow,
                    plxTableThMaxWidth,
                    PlxTableCaculateColsWidth,
                    PlxTableColResize,
                    PlxTableColResizableHandle
                ],
    exports: [PlxTableComponent],
    providers: [ViewContainerService, PlxTableService]
})
export class PlxTableModule {
    public static  forRoot(): ModuleWithProviders {
        return {ngModule: PlxTableModule, providers: [ViewContainerService, PlxTableService]};
    }
}
