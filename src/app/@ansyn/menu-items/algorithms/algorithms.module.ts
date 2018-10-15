import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlgorithmsComponent } from './algorithms/algorithms.component';
import { CoreModule } from '@ansyn/core';

@NgModule({
	imports: [CoreModule, CommonModule],
	declarations: [AlgorithmsComponent],
	entryComponents: [AlgorithmsComponent],
	exports: [AlgorithmsComponent]
})
export class AlgorithmsModule {

}
