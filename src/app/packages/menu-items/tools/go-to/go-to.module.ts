import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoToComponent } from './go-to/go-to.component';
import { FormsModule } from '@angular/forms';
import { GeoComponent } from './projections/geo/geo.component';
import { UtmComponent } from './projections/utm/utm.component';
import { GoToService } from '../services/go-to.service';

@NgModule({
	imports: [CommonModule, FormsModule],
	declarations: [GoToComponent, GeoComponent, UtmComponent],
	exports: [GoToComponent],
	providers: [GoToService]
})
export class GoToModule { }
