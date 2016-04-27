'use strict';

var vt = require('vector-tile');
var request = require('request');
var Protobuf = require('pbf');
var format = require('util').format;
var fs = require('fs');
var url = require('url');

module.exports = function(args, callback) {

    if (!args.uri) return callback(new Error('No URI found. Please provide a valid URI to your vector tile.'));

    // handle zxy stuffs
    if (args.x === undefined || args.y === undefined || args.z === undefined) {
        var zxy = args.uri.match(/\/(\d+)\/(\d+)\/(\d+)/);
        if (!zxy || zxy.length < 4) {
            return callback(new Error(format("Could not determine tile z, x, and y from %s; specify manually with -z <z> -x <x> -y <y>", JSON.stringify(args.uri))));
        } else {
            args.z = zxy[1];
            args.x = zxy[2];
            args.y = zxy[3];
        }
    }
    
    var parsed = url.parse(args.uri);
    if (parsed.protocol && (parsed.protocol === 'http:' || parsed.protocol === 'https:')) {
        request.get({
            url: args.uri,
            gzip: true,
            encoding: null
        }, function (err, response, body) {
            if (err) throw err;
            readTile(args, body, callback);
        });
    } else {
        if (parsed.protocol && parsed.protocol === 'file:') {
            args.uri = parsed.host + parsed.pathname;
        }
        fs.lstat(args.uri, function(err, stats) {
            if (err) throw err;
            if (stats.isFile()) {
                fs.readFile(args.uri, function(err, data) {
                    if (err) throw err;
                    readTile(args, data, callback);
                });
            }
        });
    } else {
        if (parsed.protocol && parsed.protocol.indexOf('file') > -1) {
            args.uri = parsed.host + parsed.pathname;
        }
        fs.lstat(args.uri, function(err, stats) {
            if (err) throw err;
            if (stats.isFile()) {
                fs.readFile(args.uri, function(err, data) {
                    if (err) throw err;
                    readTile(data);
                });
            }
        });
    }
};

function readTile(args, buffer, callback) {

    var tile = new vt.VectorTile(new Protobuf(buffer));
    var layers = args.layer || Object.keys(tile.layers);

    if (!Array.isArray(layers))
        layers = [layers]

    var collection = {type: 'FeatureCollection', features: []};

    layers.forEach(function (layerID) {
        var layer = tile.layers[layerID];
        for (var i = 0; i < layer.length; i++) {
            var feature = layer.feature(i).toGeoJSON(args.x, args.y, args.z);
            feature.coordinates = layer.feature(i).loadGeometry();
            collection.features.push(feature);
        }
    });

    callback(null, collection);
}
