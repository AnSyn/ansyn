/**
 * Created by AsafMasa on 24/04/2017.
 */
export interface IMapProvider {
  element: Element;
}

export class ImageryProvider {
  public init(data: Element) {
    data.innerHTML = ' map';
  }
}
