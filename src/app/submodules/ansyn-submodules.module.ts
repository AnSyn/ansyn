import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

@NgModule({
	imports: [
		CommonModule
	]
})
export class AnsynSubmodulesModule {
	constructor() {
		console.log("not private")
	}
}
