import { Component, EventEmitter, Inject, OnDestroy, OnInit, Output } from '@angular/core';
import { TreeviewConfig, TreeviewItem } from 'ngx-treeview';
import { OverlaysCriteria } from '@ansyn/core/models/overlay.model';
import { CaseDataInputFiltersState } from '@ansyn/core/models/case.model';
import { Observable } from 'rxjs/Observable';
import { coreStateSelector, ICoreState } from '@ansyn/core/reducers/core.reducer';
import { IStatusBarState, statusBarStateSelector } from '@ansyn/status-bar/reducers/status-bar.reducer';
import { Store } from '@ngrx/store';
import { Actions } from '@ngrx/effects';
import { IStatusBarConfig } from '@ansyn/status-bar/models/statusBar-config.model';
import { StatusBarConfig } from '@ansyn/status-bar/models/statusBar.config';
import { SetOverlaysCriteriaAction } from '@ansyn/core/actions/core.actions';
import { ComboBoxesProperties } from '@ansyn/status-bar/models/combo-boxes.model';

@Component({
	selector: 'ansyn-tree-view',
	templateUrl: './tree-view.component.html',
	styleUrls: ['./tree-view.component.less']
})
export class TreeViewComponent implements OnInit, OnDestroy {

	@Output() closeTreeView = new EventEmitter<any>();
	@Output() selectedFiltersChanged = new EventEmitter<string>(true);

	_selectedFilters: any;
	dataInputFiltersItems: TreeviewItem[] = [];

	overlaysCriteria$: Observable<OverlaysCriteria> = this.store.select(coreStateSelector)
		.pluck<ICoreState, OverlaysCriteria>('overlaysCriteria')
		.distinctUntilChanged();

	preFilter$: Observable<CaseDataInputFiltersState> = this.overlaysCriteria$
		.pluck<OverlaysCriteria, CaseDataInputFiltersState>('dataInputFilters')
		.distinctUntilChanged();

	comboBoxesProperties$: Observable<ComboBoxesProperties> = this.store.select(statusBarStateSelector)
		.pluck<IStatusBarState, ComboBoxesProperties>('comboBoxesProperties')
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
				public store: Store<IStatusBarState>,
				protected actions$: Actions) {
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
			this.comboBoxesProperties$.subscribe(() => {
			}),

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
				dataInputItem.children.forEach((sensor) => {
					const filterChecked = this._selectedFilters.filters.filter(selectedFilter => selectedFilter.sensorName === sensor.value.sensorName &&
						selectedFilter.sensorType === sensor.value.sensorType);
					sensor.checked = filterChecked.length > 0;
				});
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
