import {startTimingLog, endTimingLog } from '@ansyn/core/utils';

export abstract class BaseMapSourceProvider {

	mapType: string;

	sourceType:  string;

	create(metaData: any): any {};

	createAsync(metaData: any): Promise<any> {
		return Promise.resolve();
	};

	startTimingLog(id){
		startTimingLog(id);
	}

	endTimingLog(id){
		endTimingLog(id);
	}

}
