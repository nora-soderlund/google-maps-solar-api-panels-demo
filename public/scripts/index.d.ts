import { LatLng } from "@nora-soderlund/google-maps-solar-api";
export default class SolarPanelsMap {
    private readonly apiKeyOrProxyUrl;
    private readonly element;
    private map;
    private mapElement;
    private formElement;
    private panelElement;
    private panelSliderElement;
    private panelCountConicElement;
    private panelCountConicInnerElement;
    private panelEnergyConicElement;
    private panelEnergyConicInnerElement;
    constructor(apiKeyOrProxyUrl: string | URL, element: HTMLDivElement);
    private initMap;
    private initForm;
    private initPanel;
    private updatePanel;
    private updatePanelData;
    private solarPanelPolygonReferences;
    private solarPanelPolygons;
    private buildingInsights;
    showInsightsForCoordinate(coordinate: LatLng): Promise<void>;
    setPotentialSegment(configIndex: number): void;
    showAddressForm(): void;
}
//# sourceMappingURL=index.d.ts.map