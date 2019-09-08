import { Store } from '@ngrx/store';
import TileLayer from 'ol/layer/Tile';
import { debounceTime, distinctUntilChanged, filter, map, tap, withLatestFrom } from 'rxjs/operators';
import { Observable, Subscription } from 'rxjs';
import { BaseImageryPlugin } from '@ansyn/imagery';
import { MapFacadeService, selectMapsList } from '@ansyn/map-facade';
import { OpenLayersMap } from '@ansyn/ol';
import { ILayer } from '../../../../menu-items/layers-manager/models/layers.model';
import { selectLayers, selectSelectedLayersIds } from '../../../../menu-items/layers-manager/reducers/layers.reducer';
import { ICaseMapState } from '../../../../menu-items/cases/models/case.model';

export abstract class OpenlayersBaseLayersPlugins extends BaseImageryPlugin {

	protected subscriptions: Subscription[] = [];

	// todo: return auto-subscription when the bug is fixed
	toggleGroup$ = this.store$.select(selectMapsList).pipe(
		map((mapsList) => MapFacadeService.mapById(mapsList, this.mapId)),
		filter(Boolean),
		map((map: ICaseMapState) => !map.flags.displayLayers),
		distinctUntilChanged(),
		debounceTime(50),
		tap((newState: boolean) => this.iMap.toggleGroup('layers', newState))
	);

	// todo: return auto-subscription when the bug is fixed
	osmLayersChanges$: Observable<any[]> = this.store$.select(selectSelectedLayersIds)
		.pipe(
			withLatestFrom(this.store$.select(selectLayers)),
			tap(([selectedLayerId, layers]: [string[], ILayer[]]) => {
				layers.filter(this.checkLayer)
					.forEach((layer: ILayer) => {
						if (selectedLayerId.includes(layer.id)) {
							this.addGroupLayer(layer);
						} else {
							this.removeGroupLayer(layer.id);
						}
					});
			})
		);

	onInitSubscriptions(): void {
		super.onInitSubscriptions();
		this.subscriptions.push(
			this.toggleGroup$.subscribe(() => {
			}),
			this.osmLayersChanges$.subscribe(() => {
			})
		)
	}

	onDispose(): void {
		this.subscriptions.forEach((sub) => sub.unsubscribe());
		this.subscriptions = [];
		super.onDispose();
	}

	protected constructor(protected store$: Store<any>) {
		super();
	}

	abstract checkLayer(layer: ILayer);

	abstract createLayer(layer: ILayer): Observable<TileLayer>;

	addGroupLayer(layer: ILayer) {
		const group = OpenLayersMap.groupLayers.get(OpenLayersMap.groupsKeys.layers);
		const layersArray = group.getLayers().getArray();
		if (!layersArray.some((shownLayer) => shownLayer.get('id') === layer.id)) {
			this.createLayer(layer).subscribe((tileLayer) => {
				const _layer = tileLayer;
				group.getLayers().push(_layer);
			});
		}
	}

	removeGroupLayer(id: string): void {
		const group = OpenLayersMap.groupLayers.get(OpenLayersMap.groupsKeys.layers);
		const layersArray: any[] = group.getLayers().getArray();
		let removeIdx = layersArray.indexOf(layersArray.find(l => l.get('id') === id));
		if (removeIdx >= 0) {
			group.getLayers().removeAt(removeIdx);
		}
	}

}
