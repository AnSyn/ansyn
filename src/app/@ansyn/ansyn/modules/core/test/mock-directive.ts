import { Component, Directive, Type } from '@angular/core';

// Based on https://stackoverflow.com/a/61062312/4402222

export function MockDirective(options: Component): Type<Directive> {
	const metadata: Directive = {
		selector: options.selector,
		inputs: options.inputs,
		outputs: options.outputs
	};
	return Directive(metadata)(class MyDirective {});
}
