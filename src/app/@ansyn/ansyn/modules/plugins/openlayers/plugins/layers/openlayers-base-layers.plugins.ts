import { Store } from '@ngrx/store';
import TileLayer from 'ol/layer/Tile';
import { tap } from 'rxjs/operators';
import { combineLatest, Observable, Subscription } from 'rxjs';
import { BaseImageryPlugin } from '@ansyn/imagery';
import { selectHideLayersOnMap } from '@ansyn/map-facade';
import { AutoSubscription } from 'auto-subscriptions';
import { OpenLayersMap } from '@ansyn/ol';
import { ILayer } from '../../../../menu-items/layers-manager/models/layers.model';
import { selectLayers, selectSelectedLayersIds } from '../../../../menu-items/layers-manager/reducers/layers.reducer';

export abstract class OpenlayersBaseLayersPlugins extends BaseImageryPlugin {

	protected subscriptions: Subscription[] = [];

	// todo: return auto-subscription when the bug is fixed
	osmLayersChanges$: Observable<any[]> = combineLatest([this.store$.select(selectLayers), this.store$.select(selectSelectedLayersIds)])
		.pipe(
			tap(([result, selectedLayerId]: [ILayer[], string[]]) => {
				result.filter(this.checkLayer)
					.forEach((layer: ILayer) => {
						if (selectedLayerId.includes(layer.id)) {
							this.addGroupLayer(layer);
						} else {
							this.removeGroupLayer(layer.id);
						}
					});
			})
		);

	protected constructor(protected store$: Store<any>) {
		super();
	}

	// todo: return auto-subscription when the bug is fixed
	toggleGroup$ = () => this.store$.select(selectHideLayersOnMap(this.mapId)).pipe(
		tap((newState: boolean) => this.iMap.toggleGroup('layers', !newState))
	);

	onInitSubscriptions(): void {
		super.onInitSubscriptions();
		this.subscriptions.push(
			this.toggleGroup$().subscribe(() => {
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

	abstract checkLayer(layer: ILayer);

	abstract createLayer(layer: ILayer): Observable<TileLayer>;

	addGroupLayer(layer: ILayer) {
		// double check because it's async
		if (!this.layerExists(layer)) {
			this.createLayer(layer).subscribe((tileLayer) => {
				if (!this.layerExists(layer)) {
					this.iMap.getGroup().push(tileLayer);
				}
			});
		}
	}

	layerExists(layer: ILayer): boolean {
		const layersArray = this.iMap.getGroup().getLayers().getArray();
		const exists = layersArray.some((shownLayer) => shownLayer.get('id') === layer.id);
		return Boolean(exists);
	}

	removeGroupLayer(id: string): void {
		const layersArray: any[] = this.iMap.getGroup().getLayers().getArray();
		let removeIdx = layersArray.indexOf(layersArray.find(l => l.get('id') === id));
		if (removeIdx >= 0) {
			this.iMap.getGroup().getLayers().removeAt(removeIdx);
		}
	}

}
