import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

export const IMAGERY_VIDEO_COMPONENT_SELECTOR = 'ansyn-imagery-video';

@Component({
	selector: IMAGERY_VIDEO_COMPONENT_SELECTOR,
	templateUrl: './imagery-video.component.html',
	styleUrls: ['./imagery-video.component.less']
})
export class ImageryVideoComponent {
	@ViewChild('video') video: ElementRef<HTMLVideoElement>;

	error: boolean;
	_src: string;

	@Input()
	set src(value: string) {
		this.error = false;
		this._src = value;
		this.video.nativeElement.load();
	};

	get src(): string {
		return this._src;
	}

	@Input() rotation = 0;

	constructor(public sanitization: DomSanitizer) {
	}
}
