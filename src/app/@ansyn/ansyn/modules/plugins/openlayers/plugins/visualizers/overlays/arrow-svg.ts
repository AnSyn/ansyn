export function getIconSvg(mainColor: string, gradientColor: string = '#8cceff') {
	return 'data:image/svg+xml;base64,' + btoa(`<?xml version="1.0" encoding="UTF-8"?>
					<svg width="98px" height="122px" viewBox="0 0 98 122" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
						<!-- Generator: Sketch 53.2 (72643) - https://sketchapp.com -->
						<title>noun_Cursor_451584 Copy</title>
						<desc>Created with Sketch.</desc>
						<defs>
							<linearGradient x1="50%" y1="100%" x2="50%" y2="-2.91086054%" id="linearGradient-1">
								<stop stop-color="${ mainColor }" offset="0%"></stop>
								<stop stop-color="${ gradientColor }" offset="100%"></stop>
							</linearGradient>
						</defs>
						<g id="Symbols" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-opacity="0.7">
							<g id="cursor-copy" transform="translate(-26.000000, -14.000000)" fill="url(#linearGradient-1)" fill-rule="nonzero" stroke="#25334B" stroke-width="1.5">
								<g id="noun_Cursor_451584-Copy" transform="translate(27.000000, 15.000000)">
									<path d="M9.28808713,120 C10.6862601,120 12.084433,119.623824 13.4826059,118.871473 L47.9126142,100.626959 L82.3426225,118.871473 C83.7407954,119.623824 85.1389683,120 86.5371413,120 C89.6830303,120 92.6541478,118.30721 94.401864,115.485893 C96.1495801,112.664577 96.4991233,109.278997 95.275722,106.081505 L56.651195,6.20689655 C55.2530221,2.44514107 51.9323614,0 47.9126142,0 C43.892867,0 40.7469779,2.44514107 39.1740334,6.20689655 L0.72427796,105.893417 C-0.49912335,109.090909 -0.149580118,112.476489 1.59813604,115.297806 C3.17108058,118.30721 6.14219805,120 9.28808713,120 Z" id="Shape"></path>
								</g>
							</g>
						</g>
					</svg>`);
}
