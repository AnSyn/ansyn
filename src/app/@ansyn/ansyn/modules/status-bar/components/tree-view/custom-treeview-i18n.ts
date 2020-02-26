import { Injectable } from '@angular/core';
import { TreeviewSelection, TreeviewI18n } from 'ngx-treeview';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class CustomTreeviewI18n extends TreeviewI18n {

	constructor(protected translate: TranslateService) {
		super();
	}

	getText(selection: TreeviewSelection): string {
		const checked = selection.checkedItems.length;
		const unChecked = selection.uncheckedItems.length;
		const text = `${checked}/${checked + unChecked}`;
		return text;
	}

	getFilterNoItemsFoundText(): string {
		return this.translate.instant('No result found');
	}

	getAllCheckboxText(): string {
		return this.translate.instant('All');
	}

	getFilterPlaceholder(): string {
		return this.translate.instant('Filter');
	}

	getTooltipCollapseExpandText(isCollapse: boolean): string {
		return isCollapse ? this.translate.instant('Expand') : this.translate.instant('Collapse');
	}
}
