import { Component } from '@angular/core';
import * as packageJson from 'root/package.json';

@Component({
	selector: 'ansyn-host',
	template: `
		<ansyn-app [version]="version"></ansyn-app>
	`,
	styles: []
})
export class AnsynHostComponent {
	version = (<any>packageJson).version;
}
