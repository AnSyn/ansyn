import { Spinner } from './spinner';
import { Injectable } from '@angular/core';
/**
 * Created by AsafMas on 15/06/2017.
 */

@Injectable()
export class SpinnerService {
	constructor(){
	}

	provideSpinner (el) {
		return new Spinner(el);
	}
}

