/**
 * Created by AsafMasa on 25/04/2017.
 */
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ImageryProvider } from './imageryProvider';

@Component({
  moduleId: module.id,
  selector: 'imagery-view',
  template: `
    <div #imagery></div>
  `
})

export class ImageryComponent implements OnInit {

  @ViewChild('imagery') imageryElement: ElementRef;
  @Input() public mapComponentSettings;

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

    imageryProvider.init(element.id, 'openLayers');
  }
}
