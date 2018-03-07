import { Component, EventEmitter } from '@angular/core';

/**
 * Examples:
 * MockComponent({selector: <SELECTOR-NAME>});
 * MockComponent({selector: <SELECTOR-NAME>, inputs:['drops']})
 */
class Name {
	public selector: string;

	constructor() {

	}
}

export function MockComponent(options: Component): Component {
	const metadata: Component = {
		selector: options.selector,
		template: options.template || '',
		inputs: options.inputs,
		outputs: options.outputs
	};
	return Component(metadata)(
		class Name2 {
			constructor() {
				if (options.outputs) {
					options.outputs.forEach((output: string) => {
						this[output] = new EventEmitter();
					});
				}
			}
		} as any);
}
