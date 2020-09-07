interface IClipboard {
	writeText(newClipText: string): Promise<void>;
}

interface INavigatorClipboard extends Navigator {
	readonly clipboard?: IClipboard;
}

export function copyFromContent(content: string): Promise<any> {
	return (navigator as INavigatorClipboard).clipboard.writeText(content);
}

