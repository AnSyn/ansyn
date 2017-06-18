/**
 * Created by AsafMas on 15/06/2017.
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingSpinnerDirective } from "./loading-spinner.directive";
import { SpinnerService } from './service/loading-spinner-service';

@NgModule({
	imports: [
		CommonModule
	],
	declarations: [LoadingSpinnerDirective],
	providers: [SpinnerService],
	exports: [LoadingSpinnerDirective]
})
export class LoadingSpinnerModule { }
