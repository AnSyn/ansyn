import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlgorithmsComponent } from './algorithms/algorithms.component';
import { CoreModule } from '@ansyn/core';
import { FormsModule } from '@angular/forms';

@NgModule({
	imports: [CoreModule, CommonModule, FormsModule],
	declarations: [AlgorithmsComponent],
	entryComponents: [AlgorithmsComponent],
	exports: [AlgorithmsComponent]
})
export class AlgorithmsModule {

}
