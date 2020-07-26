import { Pipe } from '@angular/core';

/**
 * Examples:
 * MockComponent({selector: <SELECTOR-NAME>});
 * MockComponent({selector: <SELECTOR-NAME>, inputs:['drops']})
 */

export function MockPipe(name: string): Pipe {
	const metadata: Pipe = {
		name
	};
	return Pipe(metadata)(
		class Name2 {
		} as any
	);
}
