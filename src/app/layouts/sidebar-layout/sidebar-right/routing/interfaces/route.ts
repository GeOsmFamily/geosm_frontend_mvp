
  export interface Leg {
    steps: any[];
    summary: string;
    weight: number;
    duration: number;
    distance: number;
  }

  export interface Route {
    geometry: string;
    legs: Leg[];
    weight_name: string;
    weight: number;
    duration: number;
    distance: number;
  }

  export interface Waypoint {
    hint: string;
    distance: number;
    name: string;
    location: number[];
  }

  export interface Route {
    code: string;
    routes: Route[];
    waypoints: Waypoint[];
  }

