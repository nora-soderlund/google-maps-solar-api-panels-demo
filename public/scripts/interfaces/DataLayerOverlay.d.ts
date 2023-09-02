/// <reference types="@types/google.maps" />
export default class DataLayerOverlay {
    static create(bounds: google.maps.LatLngBounds, image: HTMLCanvasElement): {
        readonly bounds: google.maps.LatLngBounds;
        readonly image: HTMLCanvasElement;
        element?: HTMLDivElement | undefined;
        onAdd(): void;
        draw(): void;
        onRemove(): void;
        getMap(): google.maps.Map | google.maps.StreetViewPanorama | null;
        getPanes(): google.maps.MapPanes | null;
        getProjection(): google.maps.MapCanvasProjection;
        setMap(map: google.maps.Map | google.maps.StreetViewPanorama | null): void;
        addListener(eventName: string, handler: Function): google.maps.MapsEventListener;
        bindTo(key: string, target: google.maps.MVCObject, targetKey?: string | null | undefined, noNotify?: boolean | undefined): void;
        get(key: string): any;
        notify(key: string): void;
        set(key: string, value: any): void;
        setValues(values?: object | null | undefined): void;
        unbind(key: string): void;
        unbindAll(): void;
    };
}
//# sourceMappingURL=DataLayerOverlay.d.ts.map