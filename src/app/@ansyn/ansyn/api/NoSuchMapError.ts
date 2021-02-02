import { mapIdOrNumber } from "./ansyn-api.service";


export default class NoSuchMapError extends Error {

	constructor(id: mapIdOrNumber) {
		super(typeof id === 'string' ? `no such map with id: ${id}` : `there is no map with number ${id}`);
	}
}
