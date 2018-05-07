import { AnsynComponent } from '@ansyn/ansyn/ansyn/ansyn.component';
import { AfterViewInit, ElementRef, ViewChild } from '@angular/core';


export class AnsynCustomComponent extends AnsynComponent implements AfterViewInit {
	@ViewChild('idForBuilder') element: ElementRef;

	ngAfterViewInit() {
		setTimeout(() => {
			if (this.element) {
				this.element.nativeElement.click();
			}

		}, 3000);


	}
}




