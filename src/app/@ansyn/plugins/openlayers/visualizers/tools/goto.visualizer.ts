import { EntitiesVisualizer } from '../entities-visualizer';
import { SetActiveCenter, SetPinLocationModeAction, toolsFlags } from '@ansyn/menu-items';
import { toolsStateSelector } from '@ansyn/menu-items/tools/reducers/tools.reducer';
import { Observable } from 'rxjs/Observable';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import Icon from 'ol/style/icon';
import Style from 'ol/style/style';
import Feature from 'ol/feature';
import { Point } from 'geojson';

export class GoToVisualizer extends EntitiesVisualizer {

	goToPinAvailable$: Observable<any> = this.store$.select(toolsStateSelector)
		.filter((state) => state.flags.get(toolsFlags.pinLocation))
		.do(() => {
			this.iMap.mapObject.on('singleclick', this.singleClickListener, this);
		});

	_iconSrc: Style = new Style({
		image: new Icon({
			scale: 1,
			src: '/assets/icons/tools/go-to-map-marker.svg'
		}),
		zIndex: 100
	});

	public singleClickListener(e) {
		this.iMap.projectionService
			.projectAccurately({type: 'Point', coordinates: e.coordinate}, this.iMap)
			.subscribe((point: Point) =>
			{
				this.store$.dispatch(new SetPinLocationModeAction(false));
				this.store$.dispatch(new SetActiveCenter(point.coordinates));
				this.removeSingleClickEvent();
			});
	}

	constructor(public store$: Store<any>, public actions$: Actions) {
		super();
		this.subscriptions.push(
			this.goToPinAvailable$.subscribe(),
		);
	}

	featureStyle(feature: Feature, resolution) {
		return this._iconSrc;
	}

	public removeSingleClickEvent() {
		this.iMap.mapObject.un('singleclick', this.singleClickListener, this);
	}
}
