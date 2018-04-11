import { EntitiesVisualizer } from './entities-visualizer';
import Feature from 'ol/feature';
import Icon from 'ol/style/icon';
import Style from 'ol/style/style';
import { Observable } from 'rxjs/Observable';
import {
	ComboBoxesProperties, IStatusBarState, statusBarFlagsItemsEnum,
} from '@ansyn/status-bar';
import { statusBarStateSelector } from '@ansyn/status-bar/reducers/status-bar.reducer';
import { Store } from '@ngrx/store';
import { CaseRegionState, coreStateSelector, ICoreState, OverlaysCriteria } from '@ansyn/core';
import { Actions } from '@ngrx/effects';
import { getPointByGeometry } from '@ansyn/core/utils';

export class IconVisualizer extends EntitiesVisualizer {
	_iconSrc: Style;

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

	constructor(public store$: Store<any>, public actions$: Actions) {
		super();
		// set icon
		this._iconSrc = new Style({
			image: new Icon({
				scale: 1,
				src: '/assets/pinpoint-indicator.svg'
			}),
			zIndex: 100
		});
	}

	featureStyle(feature: Feature, resolution) {
		return this._iconSrc;
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

	drawPinPointIconOnMap(region): Observable<boolean> {
		const point = getPointByGeometry(region);

		const pinFeatureJson: GeoJSON.Feature<any> = {
			type: 'Feature',
			geometry: {
				type: 'Point',
				coordinates: point.coordinates
			},
			properties: {}
		};

		return this.setEntities([{ id: 'pinPoint', featureJson: pinFeatureJson }]);
	}

	onChanges([geoFilter, region, geoFilterIndicator]) {
		if (!geoFilterIndicator) {
			this.clearEntities();
			return Observable.empty();
		}
		if (geoFilter === 'Pin-Point') {
			return this.drawPinPointIconOnMap(region);
		}
		this.clearEntities();
		return Observable.empty();
	}
}
