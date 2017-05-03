import { OpenLayerMap } from '../maps/openLayerMap';
import { IProvidedMap } from '../model/model';
/**
 * Created by AsafMasa on 24/04/2017.
 */
export interface IMapProvider {
  element: Element;
  type: string;
}

export class ImageryMapProvider {
  public provideMapForMapType(elementId: string, type: string): IProvidedMap {
    let mapProvided;
    switch (type) {
      case 'openLayers':
        mapProvided = new OpenLayerMap(elementId);
        break;
      default:
        mapProvided = new OpenLayerMap(elementId);
    }
    return mapProvided;
  }
}
