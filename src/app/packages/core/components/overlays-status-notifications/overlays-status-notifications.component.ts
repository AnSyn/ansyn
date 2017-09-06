import { Component, Input, OnInit } from '@angular/core';

@Component({
	selector: 'ansyn-overlays-status-notifications',
	templateUrl: './overlays-status-notifications.component.html',
	styleUrls: ['./overlays-status-notifications.component.less']
})
export class OverlaysStatusNotificationsComponent implements OnInit {
	@Input() geoRegisteration;
	@Input() notFromCase;

	constructor() { }

	ngOnInit() {
	}

}
