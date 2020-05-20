import { Component, EventEmitter, Inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { TreeviewConfig, TreeviewI18n, TreeviewItem } from 'ngx-treeview';
import { IStatusBarState } from '../../reducers/status-bar.reducer';
import { Store } from '@ngrx/store';
import { flattenDeep, isEqual } from 'lodash';
import { TranslateService } from '@ngx-translate/core';
import { filter, tap } from 'rxjs/operators';
import { SetOverlaysCriteriaAction } from '../../../overlays/actions/overlays.actions';
import { selectDataInputFilter } from '../../../overlays/reducers/overlays.reducer';
import {
	IMultipleOverlaysSourceConfig,
	IOverlaysSourceProvider,
	MultipleOverlaysSourceConfig
} from '../../../core/models/multiple-overlays-source-config';
import { CustomTreeviewI18n } from './custom-treeview-i18n';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { ICaseDataInputFiltersState, IDataInputFilterValue } from '../../../menu-items/cases/models/case.model';

@Component({
	selector: 'ansyn-tree-view',
	templateUrl: './tree-view.component.html',
	styleUrls: ['./tree-view.component.less'],
	providers: [
		{ provide: TreeviewI18n, useClass: CustomTreeviewI18n }
	]
})
@AutoSubscriptions()
export class TreeViewComponent implements OnInit, OnDestroy {
	@Output() closeTreeView = new EventEmitter<any>();
	@Output() dataInputTitleChange = new EventEmitter<string>();
	@Input() dataInputItems: any[];
	dataInputFiltersItems: TreeviewItem[] = [];
	leavesCount: number;
	dataFilters: TreeviewItem[];
	dataInputFiltersConfig = TreeviewConfig.create({
		hasAllCheckBox: true,
		hasFilter: false,
		hasCollapseExpand: false, // Collapse (show all filters).
		decoupleChildFromParent: false,
		maxHeight: 400
	});

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

	_selectedFilters: IDataInputFilterValue[];

	@AutoSubscription
	onDataInputFilterChange$ = this.store.select(selectDataInputFilter).pipe(
		filter(Boolean),
		tap((_preFilter: ICaseDataInputFiltersState) => {
			this._selectedFilters = _preFilter.fullyChecked ? this.selectAll() : _preFilter.filters;
			if (Boolean(this._selectedFilters)) {
				this.dataInputFiltersItems.forEach(item => {
					item.checked = _preFilter.fullyChecked || this._selectedFilters.some(selectedFilter => selectedFilter === item.value);
				});
			}
		})
	);

	set selectedFilters(value) {
		if (!isEqual(value, this._selectedFilters)) {
			this._selectedFilters = value;
			this.dataInputFiltersChange();
		}
	}

	getAllDataInputFilter(): TreeviewItem[] {
		this.leavesCount = 0;
		const dataInputs = Object.entries(this.multipleOverlaysSourceConfig.indexProviders)
			.filter(([providerName, { inActive }]: [string, IOverlaysSourceProvider]) => !inActive)
			.map(([providerName, { dataInputFiltersConfig }]: [string, IOverlaysSourceProvider]) => {
					if (dataInputFiltersConfig.showOnlyMyChilds) {
						return dataInputFiltersConfig.children.map(child => {
							this.leavesCount++;
							return this.buildDataFilter(providerName, child);
						})
					} else {
						return {
							text: providerName,
							children: dataInputFiltersConfig.children.map(child => this.buildDataFilter(providerName, child))
						}
					}
				}
			);

		return flattenDeep(dataInputs);
	}

	buildDataFilter(providerName, filter) {
		this.leavesCount++;
		return {
			text: filter.text,
			value: {
				...filter.value,
				providerName
			},
			collapsed: false,
			children: []
		}
	}

	dataInputFiltersChange(): void {
		const isFullCheck = this.leavesCount <= this._selectedFilters.length;
		const isNoneCheck = this._selectedFilters.length === 0;

		this.store.dispatch(new SetOverlaysCriteriaAction({
			dataInputFilters: {
				fullyChecked: isFullCheck,
				filters: this._selectedFilters
			}
		}, { noInitialSearch: !isFullCheck && isNoneCheck }));
	}

	selectAll() {
		return this.dataFilters.map(filter => filter.value);
	}

	ngOnInit(): void {
	}

	ngOnDestroy(): void {
	}

}
