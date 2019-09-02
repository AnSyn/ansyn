import { select, Store } from '@ngrx/store';
import { HttpClient } from '@angular/common/http';
import { Feature, FeatureCollection } from 'geojson';
import { catchError, map, mergeMap, withLatestFrom, filter } from 'rxjs/operators';
import { combineLatest, forkJoin, Observable, of } from 'rxjs';
import { ImageryPlugin, IVisualizerEntity } from '@ansyn/imagery';
import { selectDisplayLayersOnMap, SetToastMessageAction } from '@ansyn/map-facade';
import { UUID } from 'angular2-uuid';
import { AutoSubscription } from 'auto-subscriptions';
import { EntitiesVisualizer, OpenLayersMap } from '@ansyn/ol';
import { ILayer, layerPluginTypeEnum } from '../../../../menu-items/layers-manager/models/layers.model';
import { selectLayers, selectSelectedLayersIds } from '../../../../menu-items/layers-manager/reducers/layers.reducer';

@ImageryPlugin( {
	supported: [OpenLayersMap],
	deps: [Store, HttpClient]
} )
export class OpenlayersGeoJsonLayersVisualizer extends EntitiesVisualizer {

	constructor( protected store$: Store<any>,
				protected http: HttpClient ) {
		super( {
			initial: {
				'fill-opacity': 0
			}
		} );
	}
	// isHidden$ = () => this.store$.select( selectDisplayLayersOnMap( this.mapId ) );

	@AutoSubscription
	updateLayersOnMap$ = () => this.store$.pipe(
		select(selectDisplayLayersOnMap(this.mapId)),
		withLatestFrom(this.store$.select(selectLayers), this.store$.select(selectSelectedLayersIds)),
		filter(([isHidden, layers, layersId]: [boolean, ILayer[], string[]]) => Boolean(layers)),
		mergeMap( ([isHidden, layers, layersId]) => layers
			.filter(this.isGeoJsonLayer)
			.map((layer: ILayer) => this.layerToObservable(layer, layersId, isHidden))
		)
	);

	parseLayerData( data ) {
		return data; // override if other data is used
	}

	layerToObservable( layer: ILayer, selectedLayerIds, isHidden ): Observable<boolean> {
		if (selectedLayerIds.includes( layer.id ) && !isHidden) {
			return this.http.get( layer.url )
				.pipe(
					map( ( data ) => this.parseLayerData( data ) ),
					mergeMap( ( featureCollection: any ) => {
						const entities = this.layerToEntities( featureCollection );
						return this.setEntities( entities );
					} ),
					catchError( ( e ) => {
						this.store$.dispatch( new SetToastMessageAction( {toastText: `Failed to load layer${(e && e.error) ? ' ,' + e.error : ''}`} ) );
						return of( true );
					} )
				);
		}
		return new Observable<boolean>(( observer ) => {
			this.clearEntities();
			observer.next( true );
		} );
	}

	isGeoJsonLayer( layer: ILayer ) {
		return layer.layerPluginType === layerPluginTypeEnum.geoJson;
	}

	layerToEntities( collection: FeatureCollection<any> ): IVisualizerEntity[] {
		return collection.features.map( ( feature: Feature<any> ): IVisualizerEntity => ({
			id: feature.properties.id || UUID.UUID(),
			featureJson: feature,
			style: feature.properties.style
		}) );
	}
}
