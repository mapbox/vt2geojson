'use strict';

var vt = require('vector-tile');
var request = require('request');
var Protobuf = require('pbf');
var format = require('util').format;

module.exports = function(args, callback) {
    var zxy = args.url.match(/\/(\d+)\/(\d+)\/(\d+)/);

    args.x = args.x === undefined ? zxy[2] : args.x;
    args.y = args.y === undefined ? zxy[3] : args.y;
    args.z = args.z === undefined ? zxy[1] : args.z;

    if (args.x === undefined || args.y === undefined || args.z === undefined) {
        return callback(new Error(format('Could not determine tile z, x, and y from %s; specify manually with -z <z> -x <x> -y <y>', JSON.stringify(url))));
    }

    request.get({
        url: args.url,
        gzip: true,
        encoding: null
    }, function (err, response, body) {
        if (err) throw err;

        if (response.statusCode === 401 && response.statusMessage === 'Unauthorized') {
            return callback(new Error('Invalid Token'));
        }

        var tile = new vt.VectorTile(new Protobuf(body));
        var layers = args.layer || Object.keys(tile.layers);

        if (!Array.isArray(layers))
            layers = [layers]

        var collection = {type: 'FeatureCollection', features: []};

        layers.forEach(function (layerID) {
            var layer = tile.layers[layerID];
            for (var i = 0; i < layer.length; i++) {
                var feature = layer.feature(i).toGeoJSON(args.x, args.y, args.z);
                feature.coordinates = layer.feature(i).loadGeometry();
                if (layers.length > 1) feature.properties.layer = layerID;
                collection.features.push(feature);
            }
        });

        callback(null, collection);
    });
};
