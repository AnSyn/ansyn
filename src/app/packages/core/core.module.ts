import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataLayersService } from './services/data-layers.service';

@NgModule({
  imports: [CommonModule],
  providers: [DataLayersService]
})

export class CoreModule { }
