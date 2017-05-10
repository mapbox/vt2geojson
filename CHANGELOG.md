## 1.1.5

- Fix the version issues

## 1.1.4

- Return error when request for vector tiles fails, instead of throwing it [#13](https://github.com/mapbox/vt2geojson/issues/13)

## 1.1.3

- Fix GeoJSON objects returned, which included `feauture.coordinates` which is invalid according to the GeoJSON spec [#5](https://github.com/mapbox/vt2geojson/issues/5)

## 1.1.2

- Add the `vt_layer` property to features when the request consists of multiple layers [#6](https://github.com/mapbox/vt2geojson/pull/6)
- Add tests for `401` and `404` responses from a tile server

## 1.1.1

- :bug: fix TypeError when layers didn't exist in requested vector tile [#10](https://github.com/mapbox/vt2geojson/pull/10)

## 1.1.0

- Add ability to execute command on local files [#1](https://github.com/mapbox/vt2geojson/issues/1)

## 1.0.0

- First
