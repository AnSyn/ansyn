import { EntitiesVisualizer } from '@ansyn/plugins/openlayers/visualizers/entities-visualizer';
import {
	ComboBoxesProperties, IStatusBarState, statusBarFlagsItemsEnum,
	statusBarStateSelector
} from '@ansyn/status-bar';
import { CaseGeoFilter, CaseRegionState, coreStateSelector, ICoreState, OverlaysCriteria } from '@ansyn/core';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { Actions } from '@ngrx/effects';

export abstract class RegionVisualizer extends EntitiesVisualizer {
	core$ = this.store$.select(coreStateSelector);

	flags$ = this.store$.select(statusBarStateSelector)
		.pluck<IStatusBarState, Map<statusBarFlagsItemsEnum, boolean>>('flags')
		.distinctUntilChanged();

	region$ = this.core$
		.pluck<ICoreState, OverlaysCriteria>('overlaysCriteria')
		.distinctUntilChanged()
		.pluck<OverlaysCriteria, CaseRegionState>('region');

	geoFilterIndicator$ = this.flags$
		.map(flags => flags.get(statusBarFlagsItemsEnum.geoFilterIndicator))
		.distinctUntilChanged();

	geoFilter$: Observable<any> = this.store$.select(statusBarStateSelector)
		.pluck<IStatusBarState, ComboBoxesProperties>('comboBoxesProperties')
		.distinctUntilChanged()
		.map((comboBoxesProperties) => comboBoxesProperties.geoFilter)
		.distinctUntilChanged();

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

}
