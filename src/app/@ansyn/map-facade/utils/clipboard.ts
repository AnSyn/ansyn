export function copyFromContent(content: string): Promise<any> {
	if (typeof (navigator.clipboard) === 'undefined') {
		return new Promise<boolean>(resolve => {
			const textArea = document.createElement('textarea');
			textArea.value = content;
			textArea.style.position = 'fixed';
			document.body.appendChild(textArea);
			textArea.focus();
			textArea.select();
			const copyResult: boolean = document.execCommand('copy');
			document.body.removeChild(textArea);
			resolve(copyResult);
		});
	}

	return navigator.clipboard.writeText(content);
}

