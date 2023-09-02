import { DataLayers } from "@nora-soderlund/google-maps-solar-api";
export declare function getDataLayerRgbCanvas(apiKeyOrProxyUrl: string | URL, dataLayers: DataLayers): Promise<HTMLCanvasElement>;
export declare function getDataLayerMaskCanvas(apiKey: string, dataLayers: DataLayers): Promise<HTMLCanvasElement>;
export declare function getDataLayerFluxCanvas(apiKey: string, dataLayers: DataLayers, scale: number): Promise<HTMLCanvasElement>;
export default function getDataLayersCanvas(apiKeyOrProxyUrl: string | URL, dataLayers: DataLayers): Promise<HTMLCanvasElement>;
//# sourceMappingURL=getDataLayersCanvas.d.ts.map