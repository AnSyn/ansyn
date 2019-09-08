import { Component, Inject, Input, OnInit } from '@angular/core';
import { IMapSettings } from '@ansyn/imagery';
import { ENTRY_COMPONENTS_PROVIDER, IEntryComponentsEntities } from '../../models/entry-components-provider';

@Component({
	selector: 'ansyn-floating-menu',
	templateUrl: './floating-menu.component.html',
	styleUrls: ['./floating-menu.component.less']
})
export class FloatingMenuComponent implements OnInit {

	@Input() mapState: IMapSettings;

	constructor(@Inject(ENTRY_COMPONENTS_PROVIDER) public entryComponents: IEntryComponentsEntities) {
	}

	ngOnInit() {
	}

}
