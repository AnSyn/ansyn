import { IProvidedMap } from '../model/model';
/**
 * Created by AsafMasa on 25/04/2017.
 */
import * as ol from 'openlayers';

export class OpenLayerMap implements IProvidedMap {

  constructor(elementid: string) {
    this.initMap(elementid);
  }

  private initMap(elementId: string) {
    const osm_default = new ol.layer.Tile({
      source: new ol.source.OSM()
    });

    const map = new ol.Map({
      target: elementId,
      layers: [osm_default],
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
  }

  public setBoundingRectangle(rect: GeoJSON.MultiPolygon) {

  }
  // IProvidedMap End
}
