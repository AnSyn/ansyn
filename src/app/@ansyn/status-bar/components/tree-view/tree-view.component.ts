import { Component, EventEmitter, Inject, OnDestroy, OnInit, Output } from '@angular/core';
import { TreeviewConfig, TreeviewItem } from 'ngx-treeview';
import { selectDataInputFilter } from '@ansyn/core/reducers/core.reducer';
import { IStatusBarState } from '@ansyn/status-bar/reducers/status-bar.reducer';
import { Store } from '@ngrx/store';
import { IStatusBarConfig } from '@ansyn/status-bar/models/statusBar-config.model';
import { StatusBarConfig } from '@ansyn/status-bar/models/statusBar.config';
import { SetOverlaysCriteriaAction, SetToastMessageAction } from '@ansyn/core/actions/core.actions';
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
	leavesCount: number;

	dataInputFilter$: Observable<any> = this.store.select(selectDataInputFilter);

	onDataInputFilterChange$ = this.dataInputFilter$
		.distinctUntilChanged()
		.filter(Boolean)
		.do(_preFilter => {
			this._selectedFilters = _preFilter.filters;
			this.dataInputFiltersActive = _preFilter.active;
			if (Boolean(this._selectedFilters)) {
				this.dataInputFiltersItems.forEach(root => this.updateInputDataFilterMenu(root));
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
			const tree = new TreeviewItem(f);
			this.uncheckAll(tree);
			this.dataInputFiltersItems.push(tree);

		});
	}

	uncheckAll(node: TreeviewItem) {
		node.checked = false;

		if (!this.isLeaf(node)) {
			node.children.forEach(c => this.uncheckAll(c));
		}
	}

	set selectedFilters(value) {
		this._selectedFilters = value;
	}

	get dataFilters(): TreeviewItem[] {
		this.leavesCount = 0;
		Object.keys(this.statusBarConfig.dataInputFiltersConfig)
			.forEach(providerName => {
					this.visitLeaves(this.statusBarConfig.dataInputFiltersConfig[providerName], (leaf) => {
						this.leavesCount++;
						leaf.value.providerName = providerName;
					});
				}
			);

		return Object.values(this.statusBarConfig.dataInputFiltersConfig);
	}

	visitLeaves(curr: TreeviewItem, cb: (leaf: TreeviewItem) => void) {
		if (Boolean(curr.children)) {
			curr.children.forEach(c => this.visitLeaves(c, cb));
			return;
		}
		cb(curr);
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

	updateInputDataFilterMenu(curr: TreeviewItem): void {
		if (!Boolean(this._selectedFilters)) {
			return;
		}

		if (this.isLeaf(curr)) {
			curr.checked = this._selectedFilters.some(selectedFilter => isEqual(selectedFilter, curr.value));
			return;
		}
		curr.children.forEach(c => this.updateInputDataFilterMenu(c));
		curr.checked = this.treeViewNodeStatus(curr);
	}

	isLeaf(node: TreeviewItem) {
		return !(Array.isArray(node.children) && node.children.length > 0);
	}

	treeViewNodeStatus(node: TreeviewItem): boolean {
		return node.children.every(child => child.checked) ? true : node.children.some(child => child.checked) ? undefined : false;
	}

	dataInputFiltersOk(): void {
		if (this.dataInputFiltersItems.some((provider) => provider.checked || provider.checked === undefined) || !this.dataInputFiltersActive) {
			this.store.dispatch(new SetOverlaysCriteriaAction({
				dataInputFilters: {
					fullyChecked: this.leavesCount <= this._selectedFilters.length,
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
