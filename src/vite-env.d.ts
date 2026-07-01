/// <reference types="vite/client" />

declare module '@vite-pwa/assets-generator/api' {
	export type ImageAssetsInstructions = Record<string, unknown>
	export type IconAsset = Record<string, unknown>
	export type FaviconLink = Record<string, unknown>
	export type HtmlLink = Record<string, unknown>
	export type AppleSplashScreenLink = Record<string, unknown>
	export type HtmlLinkPreset = Record<string, unknown>
}

declare module '@vite-pwa/assets-generator/config' {
	export type BuiltInPreset = Record<string, unknown>
	export type Preset = Record<string, unknown>
}