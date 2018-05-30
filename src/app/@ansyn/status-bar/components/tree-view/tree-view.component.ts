import { Component, EventEmitter, Inject, OnDestroy, OnInit, Output } from '@angular/core';
import { TreeviewConfig, TreeviewItem } from 'ngx-treeview';
import { selectDataInputFilter } from '@ansyn/core/reducers/core.reducer';
import { IStatusBarState } from '@ansyn/status-bar/reducers/status-bar.reducer';
import { Store } from '@ngrx/store';
import { IStatusBarConfig } from '@ansyn/status-bar/models/statusBar-config.model';
import { StatusBarConfig } from '@ansyn/status-bar/models/statusBar.config';
import { SetOverlaysCriteriaAction } from '@ansyn/core/actions/core.actions';
import { isEqual } from 'lodash';
import { DataInputFilterValue } from '@ansyn/core/models/case.model';
import { Observable } from 'rxjs/Observable';

@Component({
	selector: 'ansyn-tree-view',
	templateUrl: './tree-view.component.html',
	styleUrls: ['./tree-view.component.less']
})
export class TreeViewComponent implements OnInit, OnDestroy {
	@Output() closeTreeView = new EventEmitter<any>();

	_selectedFilters: DataInputFilterValue[];
	dataInputFiltersItems: TreeviewItem[] = [];

	dataInputFilter$: Observable<any> = this.store.select(selectDataInputFilter);

	onDataInputFilterChange$ = this.dataInputFilter$
		.distinctUntilChanged()
		.filter(Boolean)
		.do(_preFilter => {
			this._selectedFilters = _preFilter.filters;
			this.dataInputFiltersActive = _preFilter.active;
			if (Boolean(this._selectedFilters)) {
				this.updateInputDataFilterMenu();
			}
		});


	dataInputFiltersConfig = TreeviewConfig.create({
		hasAllCheckBox: false,
		hasFilter: false,
		hasCollapseExpand: false, // Collapse (show all filters).
		decoupleChildFromParent: false,
		maxHeight: 400
	});

	private subscribers = [];
	public dataInputFiltersActive: boolean;

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

	updateFiltersTreeActivation(activate: boolean): void {
		this.dataInputFiltersItems.forEach((dataInputItem) => {
			dataInputItem.disabled = activate;
			dataInputItem.children.forEach((sensor) => {
				sensor.disabled = activate;
			});
		});
	}


	setSubscribers() {
		this.subscribers.push(
			this.dataInputFilter$.subscribe(),
			this.onDataInputFilterChange$.subscribe()
		);
	}

	updateInputDataFilterMenu(): void {
		if (Boolean(this._selectedFilters)) {
			this.dataInputFiltersItems.forEach((dataInputItem) => {
				// first iterate the parents and update the their checkboxes.
				dataInputItem.children.forEach((sensor) => {
					sensor.checked = this._selectedFilters.some(selectedFilter => isEqual(selectedFilter, sensor.value));
				});
				// then iterate all the children and update the their checkboxes.
				if (dataInputItem.children.some(child => child.checked)) {
					// true = All / false = None / undefined = Partial
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
				filters: this._selectedFilters,
				active: this.dataInputFiltersActive
			}
		}));
		this.closeTreeView.emit();
	}

	ngOnInit(): void {
		this.setSubscribers();
		this.updateFiltersTreeActivation(!this.dataInputFiltersActive);
	}

	ngOnDestroy(): void {
		this.subscribers.forEach(sub => sub.unsubscribe());
	}

	onTreeViewClose(): void {
		this.closeTreeView.emit();
	}

	activateDataInputFilters($event) {
		this.dataInputFiltersActive = !this.dataInputFiltersActive;
		this.updateFiltersTreeActivation(!this.dataInputFiltersActive);
	}
}
