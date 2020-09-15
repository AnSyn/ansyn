import { Component, HostBinding, Inject, Input, OnInit } from '@angular/core';
import { IMapSettings } from '@ansyn/imagery';
import { ENTRY_COMPONENTS_PROVIDER, IEntryComponentsEntities } from '../../models/entry-components-provider';
export const floationMenuClassNameForExport = 'floating-menu';

@Component({
	selector: 'ansyn-floating-menu',
	templateUrl: './floating-menu.component.html',
	styleUrls: ['./floating-menu.component.less']
})
export class FloatingMenuComponent implements OnInit {
	@HostBinding(`class.${floationMenuClassNameForExport}`) readonly _ = true;
	@Input() isMinimalistViewMode: boolean;
	@Input() mapState: IMapSettings;

	@HostBinding('class.isMinimalistViewModeClass')
	get isMinimalistViewModeClass() {
		return this.isMinimalistViewMode;
	}

	constructor(@Inject(ENTRY_COMPONENTS_PROVIDER) public entryComponents: IEntryComponentsEntities) {
	}

	ngOnInit() {
	}

}
