import { Inject, Injectable } from '@angular/core';
import { AlgorithmsConfig, IAlgorithmsConfig } from '../models/algorithms.model';

@Injectable()
export class AlgorithmsService {

	constructor(@Inject(AlgorithmsConfig) public config: IAlgorithmsConfig) {
	}
}
