'use strict';

var test = require('tap').test;
var nock = require('nock');
var fs = require('fs');
var vt2geojson = require('./');

var tile = nock('http://api.mapbox.com')
    .get('/9/150/194.pbf')
    .reply(200, fs.readFileSync('fixtures/9-150-194.pbf'));

test('nj', function (t) {
    vt2geojson({
        url: 'http://api.mapbox.com/9/150/194.pbf',
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
