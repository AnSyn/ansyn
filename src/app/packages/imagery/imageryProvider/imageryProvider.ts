import { OpenLayerMap } from '../maps/openLayerMap';
/**
 * Created by AsafMasa on 24/04/2017.
 */
export interface IMapProvider {
  element: Element;
  type: string;
}

export class ImageryProvider {
  public init(elementId: string, type: string) {
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
