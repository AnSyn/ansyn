/**
 * Created by AsafMasa on 25/04/2017.
 */
import { Component, ElementRef, Input, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ImageryProvider } from '../imageryProvider/imageryProvider';
import { MapCommunicator } from '../api/mapCommunicator';
import { MapManager } from '../manager/mapManager';

@Component({
  moduleId: module.id,
  selector: 'imagery-view',
  template: `
    <div #imagery></div>
  `
})

export class ImageryComponent implements OnInit, OnDestroy {

  @ViewChild('imagery') imageryElement: ElementRef;
  @Input() public mapComponentSettings;
  @Input() public mapCommunicator: MapCommunicator;

  private _manager: MapManager;

  constructor() {
  }

  ngOnInit() {
    const imageryProvider: ImageryProvider = new ImageryProvider();
    if (!this.mapComponentSettings) {
      console.error('mapComponentSettings is Needed!');
      return;
    }
    const element = document.createElement('div');
    element.id = 'openLayersMap';
    this.imageryElement.nativeElement.appendChild(element);

    this._manager = new MapManager(this.mapCommunicator);
    const olMap = imageryProvider.init(element.id, 'openLayers');
    this._manager.setActiveMap(olMap);
  }

  ngOnDestroy() {
  	this._manager.dispose();
  }
}
