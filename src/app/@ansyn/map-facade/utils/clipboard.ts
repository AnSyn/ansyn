export function copyFromContent(content: string): Promise<any> {
	return navigator.clipboard.writeText(content);

}

