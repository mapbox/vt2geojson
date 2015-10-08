Dump vector tiles to GeoJSON

## Installation

```
npm install -g vt2geojson
```

## Usage

```
Usage: vt2geojson [options] URL

Options:
  -l, --layer  include only the specified layer
  -x           tile x coordinate (normally inferred from the URL)
  -y           tile y coordinate (normally inferred from the URL)
  -z           tile z coordinate (normally inferred from the URL)
  -h, --help   Show help  [boolean]

Examples:
  vt2geojson --layer state_label https://api.mapbox.com/v4/mapbox.mapbox-streets-v6/9/150/194.vector.pbf?access_token=${MAPBOX_ACCESS_TOKEN}
```
