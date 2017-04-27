/**
 * Created by AsafMasa on 25/04/2017.
 */
import {NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreModule } from '@ansyn/core';
import { ImageryComponent } from './imageryComponent/imagery.component';
import { ImageryCommunicatorService } from './api/imageryCommunicatorService';

@NgModule({
  imports: [CommonModule, CoreModule],
  declarations: [ImageryComponent],
  providers: [ImageryCommunicatorService],
  exports: [ImageryComponent]
})
export class ImageryModule { }
