import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapFacadeModule } from '@ansyn/map-facade';
import { EntitiesTableComponent } from './components/entities-table/entities-table.component';
import { TableRowPipe } from './pipe/table-row.pipe';
import { TranslateModule } from '@ngx-translate/core';


@NgModule({
	declarations: [
		EntitiesTableComponent,
		TableRowPipe,
	],
	imports: [
		CommonModule,
		TranslateModule,
		MapFacadeModule
	],
	exports: [
		EntitiesTableComponent
	]
})
export class EntitiesTableModule {
}
