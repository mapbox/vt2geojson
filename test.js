'use strict';

var test = require('tap').test;
var nock = require('nock');
var fs = require('fs');
var vt2geojson = require('./');

var tile1 = nock('http://api.mapbox.com')
    .get('/9/150/194.mvt')
    .reply(200, fs.readFileSync('fixtures/9-150-194.mvt'));

var tile2 = nock('http://a.tiles.mapbox.com/v4/mapbox.mapbox-streets-v7')
    .get('/16/46886/30383.mvt')
    .reply(200, fs.readFileSync('fixtures/16-46886-30383.mvt'));

var invalidTokenRequest = nock('http://invalid.mapbox.com')
    .get('/16/46886/30383.mvt')
    .reply(401);

var fourohfour = nock('http://404.mapbox.com')
    .get('/16/46886/0.mvt')
    .reply(404);

test('fails without uri', function (t) {
    vt2geojson({}, function (err, result) {
       t.ok(err);
       t.equal(err.message, 'No URI found. Please provide a valid URI to your vector tile.');
       t.notOk(result);
       t.end();
    });
});

test('fails without zxy', function (t) {
    vt2geojson({
        uri: './fixtures/9-150-194.mvt',
        layer: 'state_label'
    }, function (err, result) {
       t.ok(err);
       t.equal(err.message, 'Could not determine tile z, x, and y from "./fixtures/9-150-194.mvt"; specify manually with -z <z> -x <x> -y <y>', 'expected error message');
       t.notOk(result);
       t.end();
    });
});

test('fails with 401 response: invalid token', function (t) {
  vt2geojson({
      uri: 'http://invalid.mapbox.com/16/46886/30383.mvt',
      layer: 'state_label'
  }, function (err, result) {
      t.ok(err);
      t.ok(/Invalid Token/.test(err.message), 'expected error message');
      t.end();
  });
});

test('fails 404 response', function (t) {
  vt2geojson({
      uri: 'http://404.mapbox.com/16/46886/0.mvt',
      layer: 'state_label'
  }, function (err, result) {
      t.ok(err);
      t.ok(/Error retrieving data from/.test(err.message), 'expected error message');
      t.end();
  });
});

test('url', function (t) {
    vt2geojson({
        uri: 'http://api.mapbox.com/9/150/194.mvt',
        layer: 'state_label'
    }, function (err, result) {
        t.ifError(err);
        t.deepEqual(result.type, 'FeatureCollection');
        t.deepEqual(result.features[0].properties.name, 'New Jersey');
        t.deepEqual(result.features[0].geometry, {
            type: 'Point',
            coordinates: [-74.38928604125977, 40.15027547340139]
        });
        t.end();
    });
});

test('undefined layer', function (t) {
    vt2geojson({
        uri: 'http://a.tiles.mapbox.com/v4/mapbox.mapbox-streets-v7/16/46886/30383.mvt',
        layer: 'water'
    }, function (err, result) {
        t.ifError(err);
        t.deepEqual(result.type, 'FeatureCollection');
        t.deepEqual(result.features.length, 0);
        t.end();
    });
});


test('local file: relative', function (t) {
    vt2geojson({
        uri: './fixtures/9-150-194.mvt',
        layer: 'state_label',
        z: 9,
        x: 150,
        y: 194
    }, function (err, result) {
        t.ifError(err);
        t.deepEqual(result.type, 'FeatureCollection');
        t.deepEqual(result.features[0].properties.name, 'New Jersey');
        t.deepEqual(result.features[0].geometry, {
            type: 'Point',
            coordinates: [-74.38928604125977, 40.15027547340139]
        });
        t.end();
    });
});

test('local file: absolute uri with file: protocol', function (t) {
    vt2geojson({
        uri: 'file://./fixtures/9-150-194.mvt',
        layer: 'state_label',
        z: 9,
        x: 150,
        y: 194
    }, function (err, result) {
        t.ifError(err);
        t.deepEqual(result.type, 'FeatureCollection');
        t.deepEqual(result.features[0].properties.name, 'New Jersey');
        t.deepEqual(result.features[0].geometry, {
            type: 'Point',
            coordinates: [-74.38928604125977, 40.15027547340139]
        });
        t.end();
    });
});

test('local file with directory zxy directory structure', function (t) {
    vt2geojson({
        uri: './fixtures/9/150/194.mvt',
        layer: 'state_label'
    }, function (err, result) {
        t.ifError(err);
        t.deepEqual(result.type, 'FeatureCollection');
        t.deepEqual(result.features[0].properties.name, 'New Jersey');
        t.deepEqual(result.features[0].geometry, {
            type: 'Point',
            coordinates: [-74.38928604125977, 40.15027547340139]
        });
        t.end();
    });
});

test('local file gzipped', function (t) {
    vt2geojson({
        uri: './fixtures/9-150-194.mvt.gz',
        layer: 'state_label',
        z: 9,
        x: 150,
        y: 194
    }, function (err, result) {
        t.ifError(err);
        t.deepEqual(result.type, 'FeatureCollection');
        t.deepEqual(result.features[0].properties.name, 'New Jersey');
        t.deepEqual(result.features[0].geometry, {
            type: 'Point',
            coordinates: [-74.38928604125977, 40.15027547340139]
        });
        t.end();
    });
});

test('multiple layers adds property to preserve layer name', function (t) {
    vt2geojson({
        uri: './fixtures/16-46886-30383.mvt',
        z: 16,
        x: 46886,
        y: 30383,
        layer: ['landuse', 'poi_label']
    }, function (err, result) {
        t.equal(result.type, 'FeatureCollection', 'expected type');
        t.equal(result.features.length, 112, 'expected number of features');
        result.features.forEach(function(f) {
          var val = (f.properties.vt_layer === 'landuse' || f.properties.vt_layer === 'poi_label') ? true : false;
          t.ok(val, 'expected property value');
        });
        t.end();
    });
});
