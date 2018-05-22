import { Component, EventEmitter, Inject, OnDestroy, OnInit, Output } from '@angular/core';
import { TreeviewConfig, TreeviewItem } from 'ngx-treeview';
import { CaseDataInputFiltersState } from '@ansyn/core/models/case.model';
import { Observable } from 'rxjs/Observable';
import { selectDataInputFilter } from '@ansyn/core/reducers/core.reducer';
import { IStatusBarState } from '@ansyn/status-bar/reducers/status-bar.reducer';
import { Store } from '@ngrx/store';
import { IStatusBarConfig } from '@ansyn/status-bar/models/statusBar-config.model';
import { StatusBarConfig } from '@ansyn/status-bar/models/statusBar.config';
import { SetOverlaysCriteriaAction } from '@ansyn/core/actions/core.actions';

@Component({
	selector: 'ansyn-tree-view',
	templateUrl: './tree-view.component.html',
	styleUrls: ['./tree-view.component.less']
})
export class TreeViewComponent implements OnInit, OnDestroy {

	@Output() closeTreeView = new EventEmitter<any>();

	_selectedFilters: any;
	dataInputFiltersItems: TreeviewItem[] = [];

	preFilter$: Observable<CaseDataInputFiltersState> = this.store.select(selectDataInputFilter)
		.distinctUntilChanged();

	dataInputFiltersConfig = TreeviewConfig.create({
		hasAllCheckBox: false,
		hasFilter: false,
		hasCollapseExpand: false, // Collapse (show all filters).
		decoupleChildFromParent: false,
		maxHeight: 400
	});

	private subscribers = [];

	constructor(@Inject(StatusBarConfig) public statusBarConfig: IStatusBarConfig,
				public store: Store<IStatusBarState>) {
		this.dataFilters.forEach((f) => {
			this.dataInputFiltersItems.push(new TreeviewItem(f));
		});
	}

	set selectedFilters(value) {
		this._selectedFilters = value;
	}


	get dataFilters(): TreeviewItem[] {
		return this.statusBarConfig.dataInputFiltersConfig.filters;
	}

	setSubscribers() {
		this.subscribers.push(
			this.preFilter$.subscribe(_preFilter => {
				this._selectedFilters = _preFilter;
				if (Boolean(this._selectedFilters)) {
					this.updateInputDataFilterMenu();
				}
			})
		);
	}

	updateInputDataFilterMenu(): void {
		if (Boolean(this._selectedFilters)) {
			this.dataInputFiltersItems.forEach((dataInputItem) => {
				// first iterate the parents and update the their checkboxes.
				dataInputItem.children.forEach((sensor) => {
					sensor.checked = this._selectedFilters.filters.some(selectedFilter => selectedFilter.sensorName === sensor.value.sensorName &&
						selectedFilter.sensorType === sensor.value.sensorType);
				});
				// then iterate all the children and update the their checkboxes.
				if (dataInputItem.children.some(child => child.checked)) {
					dataInputItem.checked = dataInputItem.children.every(child => child.checked) ? true : undefined;
				}
				else {
					dataInputItem.checked = false;
				}
			});
		}
	}


	dataInputFiltersOk(): void {
		this.store.dispatch(new SetOverlaysCriteriaAction({
			dataInputFilters: {
				filters: this._selectedFilters
			}
		}));
		this.closeTreeView.emit();
	}

	ngOnInit(): void {
		this.setSubscribers();
	}

	ngOnDestroy(): void {
		this.subscribers.forEach(sub => sub.unsubscribe());
	}

	onTreeViewClose(): void {
		this.closeTreeView.emit();
	}
}
