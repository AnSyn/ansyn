import { Component, OnInit } from '@angular/core';
import { SearchMode } from "../../models/search-mode.enum";
import { IGeoFilterStatus } from "../../reducers/status-bar.reducer";
import { ClearActiveInteractionsAction } from "../../../menu-items/tools/actions/tools.actions";
import { UpdateGeoFilterStatus } from "../../actions/status-bar.actions";

@Component({
	selector: 'ansyn-timepicker-presets',
	templateUrl: './timepicker-presets.component.html',
	styleUrls: ['./timepicker-presets.component.less']
})
export class TimepickerPresetsComponent implements OnInit {

	presetDays = [
		"7 days ago",
		"30 days ago",
		"60 days ago",
		"custom"];

	timePickerPresetTitle: string;

	constructor() {
	}

	selectPreset(preset?: string) {
		console.log("preset: ", preset);
	}

	ngOnInit() {
	}

}
