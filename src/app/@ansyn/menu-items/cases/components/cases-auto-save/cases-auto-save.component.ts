import { Component, Input, OnInit } from '@angular/core';

@Component({
	selector: 'ansyn-cases-auto-save',
	templateUrl: './cases-auto-save.component.html',
	styleUrls: ['./cases-auto-save.component.less']
})
export class CasesAutoSaveComponent implements OnInit {
	@Input() trigger: any;
	public isAutoSave = false;

	constructor() {
	}

	ngOnInit() {
	}

	toggleAutoSave(event$) {
		this.isAutoSave = !this.isAutoSave;
		console.log(this.isAutoSave);
	}

}
