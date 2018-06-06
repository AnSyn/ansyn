import { Component, EventEmitter, Inject, OnDestroy, OnInit, Output } from '@angular/core';
import { TreeviewConfig, TreeviewItem, TreeviewHelper } from 'ngx-treeview';
import { selectDataInputFilter } from '@ansyn/core/reducers/core.reducer';
import { IStatusBarState } from '@ansyn/status-bar/reducers/status-bar.reducer';
import { Store } from '@ngrx/store';
import { IStatusBarConfig } from '@ansyn/status-bar/models/statusBar-config.model';
import { StatusBarConfig } from '@ansyn/status-bar/models/statusBar.config';
import { SetOverlaysCriteriaAction, SetToastMessageAction } from '@ansyn/core/actions/core.actions';
import { isEqual, isNil } from 'lodash';
import { DataInputFilterValue } from '@ansyn/core/models/case.model';
import { Observable } from 'rxjs/Observable';
import { forEach } from '@angular/router/src/utils/collection';

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
		Object.keys(this.statusBarConfig.dataInputFiltersConfig)
			.forEach(providerName => this.updateLeafsWithSourceProviders(
				this.statusBarConfig.dataInputFiltersConfig[providerName],
				providerName)
			);
		return Object.values(this.statusBarConfig.dataInputFiltersConfig);
	}

	updateLeafsWithSourceProviders(dataFiltersTree: TreeviewItem, providerName: string) {
		if (Boolean(dataFiltersTree.children)) {
			dataFiltersTree.children.forEach(c => this.updateLeafsWithSourceProviders(c, providerName));
		} else {
			dataFiltersTree.value.providerName = providerName;
		}
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
			this.dataInputFiltersItems.forEach((provider) => {
				provider.children.forEach((sensorType) => {
					if (Boolean(sensorType.children)) {
						sensorType.children.forEach((sensor) => {
							sensor.checked = this.treeViewLeafStatus(sensor);
						});
						if (sensorType.children.some(child => child.checked)) {
							// true = All / false = None / undefined = Partial
							sensorType.checked = this.treeViewNodeStatus(sensorType);
						}
						else {
							sensorType.checked = false;
						}
					} else {
						sensorType.checked = this.treeViewLeafStatus(sensorType);
					}
				});
				if (provider.children.some(child => child.checked || child.checked === undefined)) {
					provider.checked = this.treeViewNodeStatus(provider);
				}
				else {
					provider.checked = false;
				}
			});
		}
	}
	treeViewLeafStatus(child: TreeviewItem): boolean {
		return this._selectedFilters.some(selectedFilter => isEqual(selectedFilter, child.value));
	}

	treeViewNodeStatus(node: TreeviewItem): boolean {
		return node.children.every(child => child.checked) ? true : undefined;
	}

	dataInputFiltersOk(): void {
		if (this.dataInputFiltersItems.some((provider) => provider.checked || provider.checked === undefined) || !this.dataInputFiltersActive) {
			this.store.dispatch(new SetOverlaysCriteriaAction({
				dataInputFilters: {
					filters: this._selectedFilters,
					active: this.dataInputFiltersActive
				}
			}));
			this.closeTreeView.emit();
		} else {
			this.store.dispatch(new SetToastMessageAction({
				toastText: 'Please select at least one sensor'
			}));
		}
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
