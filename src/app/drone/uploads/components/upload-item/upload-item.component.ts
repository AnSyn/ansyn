import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UploadFileService } from '../../services/upload-file.service';

@Component({
	selector: 'ansyn-upload-item',
	templateUrl: './upload-item.component.html',
	styleUrls: ['./upload-item.component.less']
})
export class UploadItemComponent implements OnInit {
	@Input() name: string;
	@Input() value: number;
	@Output() moveToUpload = new EventEmitter();

	constructor(public service: UploadFileService) {
	}

	ngOnInit() {
	}

}
