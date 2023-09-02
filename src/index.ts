import { BuildingInsights, LatLng, LatLngBox, findClosestBuildingInsights, getDataLayers } from "@nora-soderlund/google-maps-solar-api";
import getDataLayersCanvas from "./controllers/getDataLayersCanvas";
import DataLayerOverlay from "./interfaces/DataLayerOverlay";

export default class SolarPanelsMap {
  private map!: google.maps.Map;
  private mapElement!: HTMLDivElement;
  private formElement!: HTMLDivElement;
  private panelElement!: HTMLDivElement;

  private panelSliderElement!: HTMLInputElement;

  private panelCountConicElement!: HTMLDivElement;
  private panelCountConicInnerElement!: HTMLDivElement;

  private panelEnergyConicElement!: HTMLDivElement;
  private panelEnergyConicInnerElement!: HTMLDivElement;

  constructor(private readonly apiKey: string, private readonly element: HTMLDivElement) {
    element.classList.add("solar-panels");

    this.initMap();
    this.initForm();
    this.initPanel();
  };

  private async initMap() {
    this.mapElement = document.createElement("div");
    this.mapElement.className = "solar-panels-map";
    this.element.append(this.mapElement);

    const { Map } = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;
    
    await google.maps.importLibrary("geometry") as google.maps.GeometryLibrary;

    this.map = new Map(this.mapElement, {
      center: {
        lat: 57.623147493770105,
        lng: 11.931981013011718
      },
      mapTypeId: "satellite",
      tilt: 0,
      styles: [
        {
          featureType: "all",
          elementType: "labels",
          stylers: [
            { visibility: "off" }
          ]
        }
      ],
      zoom: 17,
      streetViewControl: false,
      mapTypeControl: false,
      rotateControl: false
    });
  };

  private async initForm() {
    this.formElement = document.createElement("div");
    this.formElement.className = "solar-panels-form active";
    this.element.append(this.formElement);

    const { Autocomplete } = await google.maps.importLibrary("places") as google.maps.PlacesLibrary;

    const inputElement = document.createElement("input");
    inputElement.type = "text";
    inputElement.className = "solar-panels-form-input";
    this.formElement.append(inputElement);

    const autocomplete = new Autocomplete(inputElement, {
      fields: [ "geometry" ],
      types: [ "address" ]
    });

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();

      if(!place.geometry?.location)
        return alert("Something went wrong, can't resolve the location of this address!");

      this.showInsightsForCoordinate({
        latitude: place.geometry.location.lat(),
        longitude: place.geometry.location.lng()
      }).then(() => {
        this.formElement.classList.remove("active");
      }).catch((error) => {
        console.error(error);

        if(error.message.includes("404"))
          alert("Sorry, there's no coverage available for this address!");
        else
          alert("Sorry, something went wrong!");
      });
    });
  };

  private initPanel() {
    this.panelElement = document.createElement("div");
    
    const dataContainer = document.createElement("div");
    dataContainer.className = "solar-panels-panel solar-panels-panel-data";
    this.panelElement.append(dataContainer);

    const panelsCountContainer = document.createElement("div");
    panelsCountContainer.className = "solar-panels-panel-container";
    dataContainer.append(panelsCountContainer);

    const panelsCountTitle = document.createElement("h3");
    panelsCountTitle.className = "solar-panels-panel-title";
    panelsCountTitle.innerText = "Panels count";
    panelsCountContainer.append(panelsCountTitle);

    this.panelCountConicElement = document.createElement("div");
    this.panelCountConicElement.className = "solar-panels-panel-conic";
    this.panelCountConicElement.style.color = "blue";
    this.panelCountConicElement.style.setProperty("--progress", "50%");
    panelsCountContainer.append(this.panelCountConicElement);

    this.panelCountConicInnerElement = document.createElement("div");
    this.panelCountConicInnerElement.className = "solar-panels-panel-conic-inner";
    this.panelCountConicInnerElement.innerText = "50";
    this.panelCountConicElement.append(this.panelCountConicInnerElement);

    const annualEnergyContainer = document.createElement("div");
    annualEnergyContainer.className = "solar-panels-panel-container";
    dataContainer.append(annualEnergyContainer);

    const annualEnergyTitle = document.createElement("h3");
    annualEnergyTitle.className = "solar-panels-panel-title";
    annualEnergyTitle.innerText = "Annual energy";
    annualEnergyContainer.append(annualEnergyTitle);

    this.panelEnergyConicElement = document.createElement("div");
    this.panelEnergyConicElement.className = "solar-panels-panel-conic";
    this.panelEnergyConicElement.style.color = "green";
    this.panelEnergyConicElement.style.setProperty("--progress", "25%");
    annualEnergyContainer.append(this.panelEnergyConicElement);

    this.panelEnergyConicInnerElement = document.createElement("div");
    this.panelEnergyConicInnerElement.className = "solar-panels-panel-conic-inner";
    this.panelEnergyConicInnerElement.innerText = "50";
    this.panelEnergyConicElement.append(this.panelEnergyConicInnerElement);

    const sliderContainer = document.createElement("div");
    sliderContainer.className = "solar-panels-panel";
    this.panelElement.append(sliderContainer);

    this.panelSliderElement = document.createElement("input");
    this.panelSliderElement.className = "solar-panels-panel-slider";
    this.panelSliderElement.type = "range";
    this.panelSliderElement.min = "0";
    this.panelSliderElement.value = "0";
    this.panelSliderElement.step = "1";
    sliderContainer.append(this.panelSliderElement);

    this.panelSliderElement.addEventListener("input", () => {
      this.setPotentialSegment(parseInt(this.panelSliderElement.value));
    });
  };

  private updatePanel(current: number) {
    this.panelSliderElement.value = current.toString();
    this.panelSliderElement.max = (this.buildingInsights.solarPotential.solarPanelConfigs.length - 1).toString();
  };

  private updatePanelData(segmentIndex: number) {
    const solarPanelConfig = this.buildingInsights.solarPotential.solarPanelConfigs[segmentIndex];
    const lastSolarPanelConfig = this.buildingInsights.solarPotential.solarPanelConfigs[this.buildingInsights.solarPotential.solarPanelConfigs.length - 1];

    this.panelCountConicElement.style.setProperty("--progress", ((solarPanelConfig.panelsCount / lastSolarPanelConfig.panelsCount) * 75).toString() + "%");
    this.panelCountConicInnerElement.innerText = solarPanelConfig.panelsCount.toString() + "/" + lastSolarPanelConfig.panelsCount.toString();
    
    this.panelEnergyConicElement.style.setProperty("--progress", ((solarPanelConfig.yearlyEnergyDcKwh / lastSolarPanelConfig.yearlyEnergyDcKwh) * 75).toString() + "%");
    this.panelEnergyConicInnerElement.innerText = Math.round(solarPanelConfig.yearlyEnergyDcKwh).toString() + " kwh";
  };

  private solarPanelPolygonReferences: Map<BuildingInsights["solarPotential"]["solarPanels"][0], google.maps.Polygon> = new Map();
  private solarPanelPolygons: google.maps.Polygon[] = [];
  private buildingInsights!: BuildingInsights;

  public async showInsightsForCoordinate(coordinate: LatLng) {
    this.formElement.innerHTML = `<h2 class="solar-panels-form-label">Loading data...</h2>`;

    this.buildingInsights = await findClosestBuildingInsights(this.apiKey, {
      location: coordinate
    });

    this.map.moveCamera({
      center: {
        lat: this.buildingInsights.center.latitude,
        lng: this.buildingInsights.center.longitude
      },

      zoom: 21
    });

    const radius = Math.max(google.maps.geometry.spherical.computeDistanceBetween({
      lat: this.buildingInsights.boundingBox.ne.latitude,
      lng: this.buildingInsights.boundingBox.ne.longitude
    }, {
      lat: this.buildingInsights.boundingBox.sw.latitude,
      lng: this.buildingInsights.boundingBox.sw.longitude
    }) / 2, 100);

    const location = {
      lat: coordinate.latitude,
      lng: coordinate.longitude
    };

    const coordinateBounds = [
      google.maps.geometry.spherical.computeOffset(location, radius, 0),
      google.maps.geometry.spherical.computeOffset(location, radius, 90),
      google.maps.geometry.spherical.computeOffset(location, radius, 180),
      google.maps.geometry.spherical.computeOffset(location, radius, 270)
    ];

    const dataLayers = await getDataLayers(this.apiKey, {
      location: coordinate,
      radiusMeters: radius,
      view: "IMAGERY_AND_ANNUAL_FLUX_LAYERS"
    });

    const bounds = new google.maps.LatLngBounds();

    coordinateBounds.forEach((coordinate) => {
      bounds.extend(coordinate);
    });

    const image = await getDataLayersCanvas(this.apiKey, dataLayers);

    const dataLayerOverlay = DataLayerOverlay.create(bounds, image);

    dataLayerOverlay.setMap(this.map);

    this.map.controls[google.maps.ControlPosition.LEFT_TOP].push(this.panelElement);

    this.setPotentialSegment(0);

    this.updatePanel(0);
  };

  public setPotentialSegment(configIndex: number) {
    this.updatePanelData(configIndex);

    this.solarPanelPolygons.forEach((polygon) => polygon.setMap(null));
    this.solarPanelPolygons = [];

    const solarPanelConfig = this.buildingInsights.solarPotential.solarPanelConfigs[configIndex];
    
    let panelsCount = 0;
    solarPanelConfig.roofSegmentSummaries.forEach((roofSegmentSummary) => {
      this.buildingInsights.solarPotential.solarPanels.filter((solarPanel) => solarPanel.segmentIndex === roofSegmentSummary.segmentIndex).slice(0, Math.min(solarPanelConfig.panelsCount - panelsCount, roofSegmentSummary.panelsCount)).forEach((solarPanel) => {
        let height = this.buildingInsights.solarPotential.panelHeightMeters / 2;
        let width = this.buildingInsights.solarPotential.panelWidthMeters / 2;

        if(solarPanel.orientation === "LANDSCAPE") {
          const previousHeight = height;

          height = width;
          width = previousHeight;
        }

        const angle = roofSegmentSummary.azimuthDegrees;

        if(!this.solarPanelPolygonReferences.has(solarPanel)) {
          const center = {
            lat: solarPanel.center.latitude,
            lng: solarPanel.center.longitude
          };

          const top = google.maps.geometry.spherical.computeOffset(center, height, angle + 0);
          const right = google.maps.geometry.spherical.computeOffset(center, height, angle + 180);

          const topRight = google.maps.geometry.spherical.computeOffset(top, width, angle + 90);
          const bottomRight = google.maps.geometry.spherical.computeOffset(right, width, angle + 90);
          const bottomLeft = google.maps.geometry.spherical.computeOffset(right, width, angle + 270);
          const topLeft = google.maps.geometry.spherical.computeOffset(top, width, angle + 270);

          this.solarPanelPolygonReferences.set(solarPanel, new google.maps.Polygon({
            map: this.map,
            
            fillColor: "#2B2478",
            fillOpacity: 0.8,
            
            strokeWeight: 1,
            strokeColor: "#AAAFCA",
            strokeOpacity: 1,

            geodesic: false,

            paths: [
              topRight,
              bottomRight,
              bottomLeft,
              topLeft
            ]
          }));
        }

        const polygon = this.solarPanelPolygonReferences.get(solarPanel)!;
        polygon.setMap(this.map);

        this.solarPanelPolygons.push(polygon);
      });

      panelsCount += roofSegmentSummary.panelsCount;
    });
  };

  public showAddressForm() {
    this.mapElement.classList.remove("active");
  };
};

if(window)
  (window as any).SolarPanelsMap = SolarPanelsMap;