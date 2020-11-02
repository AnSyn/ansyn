import { Component, HostBinding, Inject, Input, OnInit } from '@angular/core';
import { IMapSettings } from '@ansyn/imagery';
import { ENTRY_COMPONENTS_PROVIDER, IEntryComponentsEntities } from '../../models/entry-components-provider';
import { TranslateService } from '@ngx-translate/core';
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

	@HostBinding('class.rtl')
	isRTL = this.translateService.instant('direction') === 'rtl';

	constructor(
		@Inject(ENTRY_COMPONENTS_PROVIDER) public entryComponents: IEntryComponentsEntities,
		protected translateService: TranslateService
	) {
	}

	ngOnInit() {
	}

}
