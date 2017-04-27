import { IProvidedMap } from '../model/model';
/**
 * Created by AsafMasa on 25/04/2017.
 */
import * as ol from 'openlayers';

export class OpenLayerMap implements IProvidedMap {

	private _mapObject: ol.Map;
	private mapTileLayr: ol.layer.Tile;
	private olGeoParser: ol.format.GeoJSON;

	constructor(elementid: string) {
	    this.initMap(elementid);
    }

  	private initMap(elementId: string) {
		this.mapTileLayr = new ol.layer.Tile({
	  	source: new ol.source.OSM()
		});

		this._mapObject = new ol.Map({
		  target: elementId,
		  layers: [this.mapTileLayr],
		  renderer: 'canvas',
		  controls: [],
		  view: new ol.View({
			center: ol.proj.fromLonLat([16, 38]),
			zoom: 12
		  })
		});
   }

  // IProvidedMap Start
  public set type(value: string){}
  public get type(){
    return 'openLayers';
  }

  public setCenter(center: GeoJSON.Point) {
  	const projection = this._mapObject.getView().getProjection();
  	const olCenter = ol.proj.transform([center.coordinates[0], center.coordinates[1]], 'EPSG:4326', projection);
  	//this._mapObject.getView().setCenter(olCenter);
	  this.flyTo(olCenter);
  }

  private flyTo(location) {
	const view = this._mapObject.getView();
	  view.animate({
		  center: location,
		  duration: 2000
	  });
  }

  public setBoundingRectangle(rect: GeoJSON.MultiPolygon) {
	  // let olView = this._mapObject.getView();
	  // let extenta = olView.calculateExtent(this._mapObject.getSize());
	  // extenta[0] += 1000;
	  // this.mapTileLayr.setExtent(extenta);
	  // console.log(`extent: ${JSON.stringify(extenta)}`);
  	// //[minx, miny, maxx, maxy].
  }
  // IProvidedMap End
}
