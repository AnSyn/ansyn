const clearSelection = (inputElement: HTMLInputElement | HTMLTextAreaElement, window: Window) => {
	if (inputElement) {
		inputElement.blur();
	}
	window.getSelection().removeAllRanges();
};

const selectTarget = (inputElement: HTMLInputElement | HTMLTextAreaElement): number | undefined => {
	inputElement.select();
	inputElement.setSelectionRange(0, inputElement.value.length);
	return inputElement.value.length;
};

const copyFromInputElement = (targetElm: HTMLInputElement | HTMLTextAreaElement): boolean => {
	try {
		selectTarget(targetElm);
		const re = document.execCommand('copy');
		clearSelection(targetElm, window);
		return re;
	} catch (error) {
		return false;
	}
};

const createTempTextArea = (doc: Document, window: Window): HTMLTextAreaElement => {
	const isRTL = doc.documentElement.getAttribute('dir') === 'rtl';
	let ta: HTMLTextAreaElement;
	ta = doc.createElement('textarea');
	// Prevent zooming on iOS
	ta.style.fontSize = '12pt';
	// Reset box model
	ta.style.border = '0';
	ta.style.padding = '0';
	ta.style.margin = '0';
	// Move element out of screen horizontally
	ta.style.position = 'absolute';
	ta.style[isRTL ? 'right' : 'left'] = '-9999px';
	// Move element to the same position vertically
	let yPosition = window.pageYOffset || doc.documentElement.scrollTop;
	ta.style.top = yPosition + 'px';
	ta.setAttribute('readonly', '');
	ta.style.opacity = '0';
	return ta;
};

export function copyFromContent(content: string): boolean {
	const tempTextArea: HTMLTextAreaElement = createTempTextArea(document, window);
	tempTextArea.value = content;
	document.body.appendChild(tempTextArea);
	const result: boolean = copyFromInputElement(tempTextArea);
	document.body.removeChild(tempTextArea);
	return result;
};

