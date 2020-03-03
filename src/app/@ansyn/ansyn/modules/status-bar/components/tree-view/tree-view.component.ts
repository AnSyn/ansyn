import { Component, EventEmitter, Inject, OnDestroy, OnInit, Output } from '@angular/core';
import { TreeviewConfig, TreeviewItem, TreeviewI18n } from 'ngx-treeview';
import { IStatusBarState } from '../../reducers/status-bar.reducer';
import { Store } from '@ngrx/store';
import { isEqual } from 'lodash';
import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { filter, take, tap } from 'rxjs/operators';
import { SetToastMessageAction } from '@ansyn/map-facade';
import { SetOverlaysCriteriaAction } from '../../../overlays/actions/overlays.actions';
import { selectDataInputFilter } from '../../../overlays/reducers/overlays.reducer';
import {
	IMultipleOverlaysSourceConfig,
	IOverlaysSourceProvider,
	MultipleOverlaysSourceConfig
} from '../../../core/models/multiple-overlays-source-config';
import { IDataInputFilterValue } from '../../../menu-items/cases/models/case.model';
import { CustomTreeviewI18n } from './custom-treeview-i18n';

@Component({
	selector: 'ansyn-tree-view',
	templateUrl: './tree-view.component.html',
	styleUrls: ['./tree-view.component.less'],
	providers: [
		{provide: TreeviewI18n, useClass: CustomTreeviewI18n}
	]
})
export class TreeViewComponent implements OnInit, OnDestroy {
	@Output() closeTreeView = new EventEmitter<any>();
	@Output() dataInputTitleChange = new EventEmitter<string>();
	_selectedFilters: IDataInputFilterValue[];
	dataInputFiltersItems: TreeviewItem[] = [];
	leavesCount: number;
	dataFilters: TreeviewItem[];

	dataInputFilter$: Observable<any> = this.store.select(selectDataInputFilter);

	onDataInputFilterChange$ = this.dataInputFilter$.pipe(
		filter(Boolean),
		tap(_preFilter => {
			this._selectedFilters = _preFilter.fullyChecked ? this.selectAll() : _preFilter.filters;
			this.dataInputTitleChange.emit(_preFilter.fullyChecked ? 'All' : `${this._selectedFilters.length}/${this.leavesCount}`);
			if (Boolean(this._selectedFilters)) {
				this.dataInputFiltersItems.forEach(root => this.updateInputDataFilterMenu(root));
			}
		})
	);

	dataInputFiltersConfig = TreeviewConfig.create({
		hasAllCheckBox: true,
		hasFilter: false,
		hasCollapseExpand: false, // Collapse (show all filters).
		decoupleChildFromParent: false,
		maxHeight: 400
	});

	private subscribers = [];

	constructor(@Inject(MultipleOverlaysSourceConfig) public multipleOverlaysSourceConfig: IMultipleOverlaysSourceConfig,
				public store: Store<IStatusBarState>,
				private translate: TranslateService) {

		this.dataFilters = this.getAllDataInputFilter();
		this.dataFilters.forEach((f) => {
			translate.get(f.text).subscribe((res: string) => {
				f.text = res;
				this.dataInputFiltersItems.push(new TreeviewItem(f));
			});
		});
	}

	set selectedFilters(value) {
		this._selectedFilters = value;
	}

	getAllDataInputFilter(): TreeviewItem[] {
		this.leavesCount = 0;
		return Object.entries(this.multipleOverlaysSourceConfig.indexProviders)
			.filter(([providerName, { inActive, dataInputFiltersConfig }]: [string, IOverlaysSourceProvider]) => !inActive && dataInputFiltersConfig)
			.map(([providerName, { dataInputFiltersConfig }]: [string, IOverlaysSourceProvider]) => {
					this.visitLeafes(dataInputFiltersConfig, (leaf) => {
						this.leavesCount++;
						leaf.value.providerName = providerName;
						if (leaf.text) {
							this.translate.get(leaf.text).pipe(take(1)).subscribe((res: string) => {
								leaf.text = res;
							});
						}
					});
					return dataInputFiltersConfig;
				}
			);
	}

	visitLeafes(curr: TreeviewItem, cb: (leaf: TreeviewItem) => void) {
		if (Boolean(curr.children)) {
			curr.children.forEach(c => this.visitLeafes(c, cb));
			return;
		}
		cb(curr);
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
		return node.children.every(child => child.checked) ? true : node.children.some(child => child.checked || child.checked === undefined) ? undefined : false;
	}

	dataInputFiltersOk(): void {
		if (this._selectedFilters.length === 0) {
			this.store.dispatch(new SetToastMessageAction({
				toastText: 'Please select at least one sensor'
			}));
		} else {
			const isFullCheck = this.leavesCount <= this._selectedFilters.length;
			this.store.dispatch(new SetOverlaysCriteriaAction({
				dataInputFilters: {
					fullyChecked: isFullCheck,
					filters: this._selectedFilters
				}
			}));
			this.dataInputTitleChange.emit(isFullCheck ? 'All' : `${this._selectedFilters.length}/${this.leavesCount}`);
			this.closeTreeView.emit();
		}
	}

	selectAll() {
		return this.dataFilters.reduce((filters, dataFilter, index ) => {
			filters.push(...dataFilter.children.map(c => c.value));
			return filters;
		}, [])
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
