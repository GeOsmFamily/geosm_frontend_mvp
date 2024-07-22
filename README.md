# GeOsm Frontend

## Installation

```sh
$ git clone -b cuy https://github.com/GeOsmFamily/geosm_frontend_mvp.git frontend
$ cd frontend
$ npm install
$ npx ng serve --open
```

```sh
export const environment = {
  production: true,
  url_services: 'https://cuyservices.position.cm',
  apiKey: 'RGpKEijHA8iGA0HP252kk9JxKVeq0Yt5zjakBCWheOoWbvKjrulsAG9now0kWh46',
  instance_id: 1,
  primarycolor: '#023f5f',
  nom: 'cuy',
  url_frontend: 'http://localhost:4200',
  country_code: 'ML',
  url_carto: 'https://carto.position.cm',
  url_qgis: 'https://qgis.position.cm',
};
```

```
Ajouter la limite administrative en geojson dans le fichier assets/limite/principal.geosjon
```

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.
