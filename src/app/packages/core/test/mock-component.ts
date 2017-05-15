import { Component } from '@angular/core';

/**
 * Examples:
 * MockComponent({selector: <SELECTOR-NAME>});
 * MockComponent({selector: <SELECTOR-NAME>, inputs:['drops']})
 */
export function MockComponent (options: Component) : Component{
	let metadata: Component = {    
    	selector: options.selector,
    	template: options.template || '',
    	inputs: options.inputs,
    	outputs: options.outputs
    };
    return Component(metadata)(class _ {});
}
