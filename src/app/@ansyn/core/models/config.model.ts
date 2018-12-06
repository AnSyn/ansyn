export interface IConfigModel {
	casesConfig?: {
		schema?: string;
		paginationLimit?: number;
		defaultCase?: {
			id?: string,
			name?: string,
			lastModified?: string,
			autoSave?: boolean,
			state?: {
				timeFilter?: string,
				orientation?: string,
				maps?: {
					layout?: string,
					data?: [
						{
							data?: {
								position?: {
									extentPolygon?: {
										type?: string,
										coordinates?: number[][]
									},
									projectedState?: {
										center?: number[],
										projection?: {
											code?: string
										},
										resolution?: number,
										rotation?: number,
										zoom?: number
									}
								}
							},
							flags?: {},
							worldView?: {
								mapType?: string,
								sourceType?: string
							},
							id?: string
						}
						],
					activeMapId?: string
				},
				layers?: {
					activeLayersIds?: string[]
				},
				favoriteOverlays?: string[],
				removedOverlaysIds?: string[],
				removedOverlaysVisibility?: boolean,
				region?: {
					type?: string,
					coordinates?: number[],
				},
				dataInputFilters?: {
					filters?: string[],
					active?: boolean
				},
				time?: any,
				facets?: {
					showOnlyFavorites?: boolean,
					filters?: [
						{
							fieldName?: string,
							metadata?: {
								displayTrue?: boolean,
								displayFalse?: boolean
							},
							type?: string
						}
						]
				}
			}
		},
		casesQueryParamsKeys?: string[]
		updateCaseDebounceTime?: number,
		useHash?: boolean
	},
	layersManagerConfig?: {
		schema?: string
	},
	overlaysConfig?: {
		limit?: number
	},
	mapFacadeConfig?: {
		overlayCoverage?: number,
		displayDebounceTime?: number,
		sourceTypeNotices?: {
			PLANET?: {
				Default?: string
			},
			OPEN_AERIAL?: {
				Default?: string
			}
		},
		sensorTypeShortcuts?: {
			Panchromatic?: string
		},
		contextMenu?: {
			filterField?: string
		},
		mapSearch?: {
			active?: true,
			url?: string,
			apiKey?: string
		}
	},
	mapSourceProvidersConfig?: {
		BING?: {
			key?: string,
			styles?: string[]
		},
		TileWMS?: {},
		ESRI_4326?: {
			baseUrl?: string,
			projection?: string,
			maxZoom?: number,
			tileSize?: number,
			attributions?: string
		}
	},
	filtersConfig?: {
		shortFilterListLength?: number,
		filters?: [
			{
				modelName?: string,
				displayName?: string,
				type?: string
			},
			{
				modelName?: string,
				displayName?: string,
				type?: string
			},
			{
				modelName?: string,
				displayName?: string,
				type?: string
			},
			{
				modelName?: string,
				displayName?: string,
				type?: Boolean,
				customData?: {
					displayTrueName?: string,
					displayFalseName?: string
				}
			},
			{
				modelName?: string,
				displayName?: string,
				type?: string
			},
			{
				modelName?: string,
				displayName?: string,
				type?: string
			}
			]
	},
	contextConfig?: {
		schema?: string
	},
	toolsConfig?: {
		Annotations?: {
			displayId?: number
		},
		GoTo?: {
			from?: {
				datum?: string,
				projection?: string
			},
			to?: {
				datum?: string,
				projection?: string
			}
		},
		Proj4?: {
			ed50?: string,
			ed50Customized?: string
		},
		ImageProcParams?: [
			{
				name?: string,
				defaultValue?: number,
				min?: number,
				max?: number
			},
			{
				name?: string,
				defaultValue?: number,
				min?: number,
				max?: number
			},
			{
				name?: string,
				defaultValue?: number,
				min?: number,
				max?: number
			},
			{
				name?: string,
				defaultValue?: number,
				min?: number,
				max?: number
			},
			{
				name?: string,
				defaultValue?: number,
				min?: number,
				max?: number
			}
			]
	},
	loggerConfig?: {
		env?: string,
		active?: false
	},
	statusBarConfig?: {
		toolTips?: {
			orientation?: string,
			geoFilter?: string,
			geoFilterEdit?: string,
			geoFilterShow?: string,
			timeFilter?: string,
			dataInputFilter?: string,
			timeFilterEdit?: string,
			screenNumber?: string,
			overlayCount?: string,
			backwards?: string,
			forward?: string,
			reset?: string,
			enlarge?: string,
			quickloop?: string
		},
		dataInputFiltersConfig?: {
			IMISIGHT?: {
				inActive?: true,
				treeViewItem?: {
					text?: string,
					value?: 1,
					collapsed?: true,
					children?: [
						{
							text?: string,
							value?: {
								sensorType?: string
							}
						}
						]
				}
			},
			PLANET?: {
				inActive?: false,
				treeViewItem?: {
					text?: string,
					value?: 1,
					collapsed?: true,
					children?: [
						{
							text?: string,
							value?: {
								sensorType?: string
							}
						},
						{
							text?: string,
							value?: {
								sensorType?: string
							}
						},
						{
							text?: string,
							value?: {
								sensorType?: string
							}
						},
						{
							text?: string,
							value?: {
								sensorType?: string
							}
						},
						{
							text?: string,
							value?: {
								sensorType?: string
							}
						},
						{
							text?: string,
							value?: {
								sensorType?: string
							}
						},
						{
							text?: string,
							value?: {
								sensorType?: string
							}
						}
						]
				}
			},
			OPEN_AERIAL?: {
				inActive?: false,
				treeViewItem?: {
					text?: string,
					value?: 1,
					indeterminate?: true,
					collapsed?: true,
					children?: [
						{
							text?: string,
							value?: {
								sensorType?: string
							}
						}
						]
				}
			}
		}
	},
	coreConfig?: {
		welcomeNotification?: {
			headerText?: string,
			mainText?: string
		},
		storageService?: {
			baseUrl?: string
		},
		translation?: any,
		needToUseLayerExtent?: false
	},
	menuConfig?: {
		path?: string,
		color?: string,
		background?: string,
		mode?: string,
		forkMe?: {
			active?: true,
			image?: string,
			title?: string,
			href?: string
		}
	},
	loginConfig?: {
		baseUrl?: string,
		active?: false,
		authorizedPath?: string
	},
	visualizersConfig?: {
		FrameVisualizer?: {
			colors?: {
				active?: string,
				inactive?: string
			}
		},
		FootprintPolylineVisualizer?: {
			colors?: {
				active?: string,
				inactive?: string,
				display?: string,
				favorite?: string
			}
		},
		exampleFootprintHeatmapVisualizer?: {
			initial?: {
				fill?: {
					color?: string
				},
				stroke?: {
					color?: string,
					width?: number
				}
			},
			hover?: {
				fill?: {
					color?: string
				},
				stroke?: {
					color?: string,
					width?: number
				}
			},
			entities?: {
				yellow?: {
					initial?: {
						fill?: {
							color?: string
						}
					}
				},
				blue?: {
					initial?: {
						fill?: {
							color?: string
						}
					}
				}
			}
		}
	},
	multipleOverlaysSourceConfig?: {
		defaultProvider?: {
			inActive?: false,
			whitelist?: [
				{
					name?: string,
					dates?: [
						{
							start?: null,
							end?: null
						}
						],
					sensorNames?: [null],
					coverage?: number[][]
				}
				],
			blacklist?: string[]
		},
		IDAHO?: {
			inActive?: true,
			whitelist?: [
				{
					name?: string,
					dates?: [
						{
							start?: null,
							end?: null
						}
						],
					sensorNames?: [null],
					coverage?: number[][]
				}
				],
			blacklist?: string[]
		},
		PLANET?: {
			inActive?: false,
			whitelist?: [
				{
					name?: string,
					dates?: [
						{
							start?: null,
							end?: null
						}
						],
					sensorNames?: string[],
					coverage?: number[][]
				},
				{
					name?: string,
					dates?: [
						{
							start?: null,
							end?: null
						}
						],
					sensorNames?: [null],
					coverage?: number[][]
				}
				],
			blacklist?: string[]
		},
		OPEN_AERIAL?: {
			inActive?: false,
			whitelist?: [
				{
					name?: string,
					dates?: [
						{
							start?: null,
							end?: null
						}
						],
					sensorNames?: [null],
					coverage?: number[][]
				}
				],
			blacklist?: string[]
		},
		IMISIGHT?: {
			inActive?: true,
			whitelist?: [
				{
					name?: string,
					dates?: [
						{
							start?: null,
							end?: null
						}
						],
					sensorNames?: [null],
					coverage?: number[][]
				}
				],
			blacklist?: string[]
		}
	},
	idahoOverlaysSourceConfig?: {
		defaultApi?: string,
		baseUrl?: string,
		overlaysByTimeAndPolygon?: string
	},
	openAerialOverlaysSourceConfig?: {
		baseUrl?: string
	},
	imisightOverlaysSourceConfig?: {
		baseUrl?: string
	},
	planetOverlaysSourceConfig?: {
		baseUrl?: string,
		itemTypes?: string[],
		apiKey?: string,
		tilesUrl?: string,
		delayMultiple?: number
	},
	auth0Config?: {
		auth0Active?: false,
		clientID?: string,
		domain?: string,
		responseType?: string,
		audience?: string,
		callbackURL?: string,
		scope?: string
	},
	ORIENTATIONS?: string[]
}
