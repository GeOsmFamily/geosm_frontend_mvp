

    export interface Address {
        highway: string;
        road: string;
        village: string;
        state_district: string;
        state: string;
        postcode: string;
        country: string;
        country_code: string;
    }

    export interface NominatimReverse {
        place_id: number;
        licence: string;
        osm_type: string;
        osm_id: number;
        lat: string;
        lon: string;
        display_name: string;
        address: Address;
        boundingbox: string[];
    }


