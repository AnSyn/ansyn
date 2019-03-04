import { Component } from '@angular/core';
import * as packageJson from 'root/package.json';
import { AuthService } from '../../login/services/auth.service';

@Component({
	selector: 'ansyn-host',
	template: `
		<ansyn-app [ngClass]="authService.user?.role" [version]="version"></ansyn-app>
	`,
	styleUrls: [`./ansyn-host.component.less`]
})
export class AnsynHostComponent {
	version = (<any>packageJson).version;
	constructor(public authService: AuthService) {
	}
}
