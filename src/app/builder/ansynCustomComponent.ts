import { AnsynComponent } from '@ansyn/ansyn/ansyn/ansyn.component';
import { AfterViewInit } from '@angular/core';


export class AnsynCustomComponent extends AnsynComponent implements AfterViewInit {

	
	ngAfterViewInit() {
		const element = document.getElementsByTagName('ansyn-menu');
		if (element && element[0]) {
			(<any>element[0]).click();
		}


	}
}




