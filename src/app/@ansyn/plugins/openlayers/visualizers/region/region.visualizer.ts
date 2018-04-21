import { EntitiesVisualizer } from '@ansyn/plugins/openlayers/visualizers/entities-visualizer';
import {
	IStatusBarState, statusBarFlagsItemsEnum,
	statusBarStateSelector
} from 'app/@ansyn/status-bar/index';
import { CaseGeoFilter, CaseRegionState, coreStateSelector, ICoreState, OverlaysCriteria } from 'app/@ansyn/core/index';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { Actions } from '@ngrx/effects';
import { ContextMenuTriggerAction, MapActionTypes } from '@ansyn/map-facade';
import { Position } from 'geojson';
import { selectGeoFilter } from '@ansyn/status-bar';

export abstract class RegionVisualizer extends EntitiesVisualizer {
	core$ = this.store$.select(coreStateSelector);

	statusBarFlags$ = this.store$.select(statusBarStateSelector)
		.pluck<IStatusBarState, Map<statusBarFlagsItemsEnum, boolean>>('flags')
		.distinctUntilChanged();

	region$ = this.core$
		.pluck<ICoreState, OverlaysCriteria>('overlaysCriteria')
		.distinctUntilChanged()
		.pluck<OverlaysCriteria, CaseRegionState>('region');

	geoFilterIndicator$ = this.statusBarFlags$
		.map((flags: Map<statusBarFlagsItemsEnum, boolean>) => flags.get(statusBarFlagsItemsEnum.geoFilterIndicator))
		.distinctUntilChanged();

	geoFilter$: Observable<any> = this.store$.select(selectGeoFilter)
		.distinctUntilChanged();

	isActiveGeoFilter$ = this.geoFilter$
		.map((geoFilter: CaseGeoFilter) => geoFilter === this.geoFilter);

	geoFilterSearch$ = this.statusBarFlags$
		.map((flags) => flags.get(statusBarFlagsItemsEnum.geoFilterSearch))
		.distinctUntilChanged();

	onSearchMode$ = Observable.combineLatest(this.geoFilterSearch$, this.isActiveGeoFilter$)
		.map(([geoFilterSearch, isActiveGeoFilter]) => geoFilterSearch && isActiveGeoFilter)
		.distinctUntilChanged();

	onContextMenu$: Observable<any> = this.actions$
		.ofType<ContextMenuTriggerAction>(MapActionTypes.TRIGGER.CONTEXT_MENU)
		.withLatestFrom(this.isActiveGeoFilter$)
		.filter(([action, isActiveGeoFilter]: [ContextMenuTriggerAction, boolean]) => isActiveGeoFilter)
		.map(([{ payload }]) => payload)
		.do(this.onContextMenu.bind(this));

	constructor(public store$: Store<any>, public actions$: Actions, public geoFilter: CaseGeoFilter) {
		super();
	}


	onInit() {
		super.onInit();
		this.subscriptions.push(

			this.geoFilterIndicator$
				.withLatestFrom(this.geoFilter$, this.region$, (geoFilterIndicator, geoFilter, region) => [
					geoFilter,
					region,
					geoFilterIndicator
				])
				.mergeMap(this.onChanges.bind(this))
				.subscribe(),

			this.region$
				.withLatestFrom(this.geoFilter$, this.geoFilterIndicator$, (region, geoFilter, geoFilterIndicator) => [
					geoFilter,
					region,
					geoFilterIndicator
				])
				.mergeMap(this.onChanges.bind(this))
				.subscribe(),

			this.geoFilter$
				.withLatestFrom(this.region$, this.geoFilterIndicator$, (geoFilter, region, geoFilterIndicator) => [
					geoFilter,
					region,
					geoFilterIndicator
				])
				.mergeMap(this.onChanges.bind(this))
				.subscribe(),
			this.onContextMenu$.subscribe()
		)
	}

	onChanges([geoFilter, region, geoFilterIndicator]) {
		if (!geoFilterIndicator) {
			this.clearEntities();
			return Observable.empty();
		}
		if (geoFilter === this.geoFilter) {
			return this.drawRegionOnMap(region);
		}
		this.clearEntities();
		return Observable.empty();
	}

	abstract drawRegionOnMap(region: CaseRegionState): Observable<boolean> ;

	abstract onContextMenu(point: Position): void;
}
