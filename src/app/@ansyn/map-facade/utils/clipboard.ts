export function copyFromContent(content: string): Promise<any> {
	if (typeof (navigator.clipboard) === 'undefined') {
		const textArea = document.createElement('textarea');
		textArea.value = content;
		textArea.style.position = 'fixed';
		document.body.appendChild(textArea);
		textArea.focus();
		textArea.select();
		document.execCommand('copy');
		document.body.removeChild(textArea);
		return;
	}

	return navigator.clipboard.writeText(content);
}

