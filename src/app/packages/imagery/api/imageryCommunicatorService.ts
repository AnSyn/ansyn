/**
 * Created by AsafMasa on 27/04/2017.
 */
import { Injectable } from '@angular/core';
import { ImageryCommunicator } from './imageryCommunicator';

@Injectable()
export class ImageryCommunicatorService {

	public imageryCommunicator: ImageryCommunicator = new ImageryCommunicator();
	constructor() {
	}
}
