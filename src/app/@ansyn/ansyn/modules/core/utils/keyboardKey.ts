/**
 * module to inspect which key was press on keyboard event.
 * compatibility with chrome 44.
 * @param event keyboard event
 */

export function isArrowRightKey(event: KeyboardEvent) {
	return event.key === 'ArrowRight' || event.which === 39;
}

export function isArrowLeftKey(event: KeyboardEvent) {
	return event.key === 'ArrowLeft' || event.which === 37;
}

export function isBackspaceKey(event: KeyboardEvent) {
	return event.key === 'Backspace' || event.which === 8;
}

export function isEnterKey(event: KeyboardEvent) {
	return event.key === 'Enter' || event.which === 13;
}

export function isDigitKey(event: KeyboardEvent) {
	return (event.key !== ' ' && !isNaN(Number(event.key))) || event.which >= 48 && event.which <= 57;
}

export function isEscapeKey(event: KeyboardEvent) {
	return event.key === 'Escape' || event.which === 27;
}
