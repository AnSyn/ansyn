import { Component, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { select, Store } from '@ngrx/store';
import { DataLayersService } from '../../services/data-layers.service';
import { AddLayer, LogImportLayer } from '../../actions/layers.actions';
import { combineLatest, fromEvent, Observable } from 'rxjs';
import { UUID } from 'angular2-uuid';
import {
	IMapState, MapFacadeService,
	mapStateSelector,
	selectActiveMapId,
	SetMapPositionByRectAction,
	SetToastMessageAction
} from '@ansyn/map-facade';
import { delay, filter, map, retryWhen, tap, withLatestFrom } from 'rxjs/operators';
import { FeatureCollection, Polygon } from 'geojson';
import KmlFormat from 'ol/format/KML';
import GeoJSONFormat from 'ol/format/GeoJSON';
import shp from 'shpjs';
import { getErrorMessageFromException } from '../../../../core/utils/logs/timer-logs';
import { bboxFromGeoJson, IMapSettings, polygonFromBBOX, validateFeatureProperties } from '@ansyn/imagery';
import { forEach } from 'lodash';

@Component({
	selector: 'ansyn-import-layer',
	templateUrl: './import-layer.component.html',
	styleUrls: ['./import-layer.component.less']
})
@AutoSubscriptions({
	init: 'ngOnInit',
	destroy: 'ngOnDestroy'
})
export class ImportLayerComponent implements OnInit, OnDestroy {
	reader = new FileReader();
	shpReader = new FileReader();
	dbfReader = new FileReader();
	kmlFormat = new KmlFormat();
	geoJsonFormat = new GeoJSONFormat();
	file: File;
	fileType: string;
	onReadLayer$ = new EventEmitter<{ data: any, name: string }>();

	@AutoSubscription
	onFileLoad$: Observable<any> = fromEvent(this.reader, 'load').pipe(
		tap(() => {
			let layerData = { name: this.layerName, data: null };
			const readerResult: string = <string>this.reader.result;
			switch (this.fileType.toLowerCase()) {
				case 'kml':
					const features = this.kmlFormat.readFeatures(readerResult);
					this.prepareKMLFeature(features);
					layerData.data = this.geoJsonFormat.writeFeaturesObject(features);
					this.onReadLayer$.emit(layerData);
					break;
				case 'json':
				case 'geojson':
					layerData.data = JSON.parse(readerResult);
					this.onReadLayer$.emit(layerData);
					break;
				case 'shp':
					layerData.data = this.addShapeFileLayer(readerResult);
					this.onReadLayer$.emit(layerData);
					break;
				case 'zip':
					layerData.data = shp.parseZip(readerResult);
					this.onReadLayer$.emit(layerData);
					break;
				default:
					throw new Error('Can\'t read file type');
			}
		}),
		retryWhen((error) => error.pipe(
			tap((err) => this.importError(err)),
			delay(100)
		))
	);

	@AutoSubscription
	onShpAndDbfFilesLoad$: Observable<any> = combineLatest([
		fromEvent(this.shpReader, 'load'),
		fromEvent(this.dbfReader, 'load')
	]).pipe(
		tap(() => {
			let layerData = { name: this.layerName, data: null };
			layerData.data = this.addShapeFileLayer(this.shpReader.result, this.dbfReader.result);
			this.onReadLayer$.emit(layerData);
		}),
		retryWhen((error) => error.pipe(
			tap((err) => this.importError(err)),
			delay(100)
		))
	);

	@AutoSubscription
	onReadLayerSuccess$ = this.onReadLayer$.pipe(
		map((layer) => {
			this.generateFeatureCollection(layer.data, layer.name);
			return layer;
		}),
		withLatestFrom(this.store.select(mapStateSelector)),
		map(([layer, mapState]: [any, IMapState]) => [layer, MapFacadeService.activeMap(mapState)]),
		filter(([layer, activeMap]: [any, IMapSettings]) => !Boolean(activeMap.data.overlay)),
		map(([layer, activeMap]: [any, IMapSettings]) => {
			return this.calculateLayerBbox(layer.data);
		}),
		filter(Boolean),
		withLatestFrom(this.store.pipe(select(selectActiveMapId))),
		tap(([layerBbox, activeMapId]: [Polygon, string]) => this.store.dispatch(new SetMapPositionByRectAction({
			id: activeMapId,
			rect: layerBbox
		}))),
		retryWhen((error) =>
			error.pipe(
				tap((err) => this.importError(err)),
				delay(100)
			))
	);

	constructor(
		private store: Store<any>,
		private dataLayersService: DataLayersService
		) {
	}

	importLayer(files: FileList) {
		this.file = files.item(0);
		this.store.dispatch(new LogImportLayer({ fileName: this.file.name }));
		this.fileType = this.getFileType(this.file.name);
		if (files.length === 2) {
			this.importShpAndDbf(files);
		} else if (this.fileType.toLocaleLowerCase() === 'shp' || 'zip') {
			this.reader.readAsArrayBuffer(this.file);
		} else {
			this.reader.readAsText(this.file, 'UTF-8');
		}
	}

	importShpAndDbf(files: FileList) {
		forEach(files, file => {
			const fileType = this.getFileType(file.name);
			const reader = fileType.toLocaleLowerCase() === 'shp' ? "shpReader" : "dbfReader";
			this[reader].readAsArrayBuffer(file);
		});
	}

	addShapeFileLayer(shpBuffer, dbfBuffer?) {
		const shaFile = shp.parseShp(shpBuffer);
		const dbfFile = Boolean(dbfBuffer) ? shp.parseDbf(dbfBuffer) : [];
		return shp.combine([shaFile, dbfFile]);
	}

	generateFeatureCollection(layerData, layerName) {
		if (this.isFeatureCollection(layerData)) {
			this.ValidateFeatures(layerData);
			const isNonEditable = this.isNonEditable(layerData);
			const layer = this.dataLayersService.generateAnnotationLayer(layerName, layerData, isNonEditable);
			this.store.dispatch(new AddLayer(layer));
		} else {
			throw new Error('Not a feature collection');
		}
	}

	ngOnInit(): void {
	}

	ngOnDestroy(): void {
	}

	isFeatureCollection(json): boolean {
		return json && json.type === 'FeatureCollection' && Array.isArray(json.features);
	}

	isNonEditable(featureCollection: FeatureCollection): boolean {
		return featureCollection.features.some((feature) => feature.properties.isNonEditable);
	}

	ValidateFeatures(annotationsLayer): void {
		/* reference */
		annotationsLayer.features.forEach((feature, index, features) => {
			features[index] = validateFeatureProperties(feature);
			features[index].id = UUID.UUID();
			features[index].properties.id = features[index].id;
		});
	}

	private prepareKMLFeature(features) {
		// on kml label and style return as a string
		const fixProperties = (feature, tag) => {
			const oldProp = feature.get(tag);
			let parsedProp;
			try {
				parsedProp = JSON.parse(oldProp);
			} catch {
				parsedProp = oldProp;
			} finally {
				feature.set(tag, parsedProp);
			}
		};
		features.forEach((feature) => {
			['style', 'label'].forEach((tag) => fixProperties(feature, tag));
		})
	}

	private importError(error) {
		this.store.dispatch(new SetToastMessageAction({
			showWarningIcon: true,
			toastText: getErrorMessageFromException(error, 'Failed to import file')
		}));
	}

	private calculateLayerBbox(layer) {
		if (layer.features.length > 0) {
			let layerBbox;
			if (layer.bbox) {
				layerBbox = layer.bbox;
			} else {
				layerBbox = bboxFromGeoJson(layer);
			}
			return polygonFromBBOX(layerBbox);
		}
	}

	private getFileType(fileName) {
		return fileName.slice(fileName.lastIndexOf('.') + 1);
	}

	get layerName() {
		return this.file.name.slice(0, this.file.name.lastIndexOf('.'));
	}
}
