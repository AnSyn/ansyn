/**
 * Created by AsafMasa on 25/04/2017.
 */
import {NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageryComponent } from './imageryComponent/imagery.component';
import { ImageryCommunicatorService } from './api/imageryCommunicatorService';
import { ImageryProviderService } from './imageryProviderService/imageryProviderService';

@NgModule({
  imports: [CommonModule],
  declarations: [ImageryComponent],
  providers: [ImageryCommunicatorService, ImageryProviderService],
  exports: [ImageryComponent]
})
export class ImageryModule { }
