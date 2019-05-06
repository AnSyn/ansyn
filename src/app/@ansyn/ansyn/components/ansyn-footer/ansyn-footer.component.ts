import { Component, Input, OnInit } from '@angular/core';
import { ICaseMapState } from '../../modules/menu-items/cases/models/case.model';

@Component({
	selector: 'ansyn-footer',
	templateUrl: './ansyn-footer.component.html',
	styleUrls: ['./ansyn-footer.component.less']
})
export class AnsynFooterComponent implements OnInit {
	@Input() selectedCaseName: string;
	@Input() activeMap: ICaseMapState;

	constructor() {
	}

	ngOnInit() {
	}

}
