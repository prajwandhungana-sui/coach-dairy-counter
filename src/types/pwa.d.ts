declare module 'virtual:pwa-register' {
  export function registerSW(options?: any): any
  export default registerSW
}

declare module '@vite-pwa/assets-generator/api' {
  export type ImageAssetsInstructions = any
  export type IconAsset = any
  export type FaviconLink = any
  export type HtmlLink = any
  export type AppleSplashScreenLink = any
  export type HtmlLinkPreset = any
}

declare module '@vite-pwa/assets-generator/config' {
  export type BuiltInPreset = any
  export type Preset = any
}
