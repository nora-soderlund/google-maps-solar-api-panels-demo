export default class DataLayerOverlay {
  static create(bounds: google.maps.LatLngBounds, image: HTMLCanvasElement) {
    return new (class extends google.maps.OverlayView {
      readonly bounds: google.maps.LatLngBounds;
      readonly image: HTMLCanvasElement;
    
      element?: HTMLDivElement;
    
      constructor(bounds: google.maps.LatLngBounds, image: HTMLCanvasElement) {
        super();
    
        this.bounds = bounds;
        this.image = image;
      };
    
      onAdd() {
        this.element = document.createElement("div");
        this.element.style.borderStyle = "none";
        this.element.style.borderWidth = "0px";
        this.element.style.position = "absolute";
    
        this.image.style.width = "100%";
        this.image.style.height = "100%";
        this.image.style.position = "absolute";
        this.element.append(this.image);
    
        const panes = this.getPanes();
    
        panes?.overlayLayer.appendChild(this.element);
      };
    
      draw() {
        if(this.element) {
          const overlayProjection = this.getProjection();
    
          const southWest = overlayProjection.fromLatLngToDivPixel(this.bounds.getSouthWest());
          const northEast = overlayProjection.fromLatLngToDivPixel(this.bounds.getNorthEast());
   
          if(!southWest || !northEast)
            return;

          this.element.style.left = southWest.x + "px";
          this.element.style.top = northEast.y + "px";
          this.element.style.width = northEast.x - southWest.x + "px";
          this.element.style.height = southWest.y - northEast.y + "px";
        }
      };
    
      onRemove() {
        if(this.element) {
          this.element.parentNode?.removeChild(this.element);
    
          delete this.element;
        }
      };
    })(bounds, image);
  };
};
