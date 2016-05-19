define([
    'jquery',
    'lodash',
    'interact',
    'taoQtiItem/qtiCommonRenderer/helpers/interactUtils'
], function($, _, interact, pointerEvents){
    'use strict';

    module('tapOn()');

    QUnit.asyncTest('fire mousedown and mouseup events', function(assert){
        QUnit.expect(3);

        var button = document.getElementById('button');
        button.addEventListener('mousedown', function mousedown() {
            assert.ok(true, 'mousedown has been fired');
        });
        button.addEventListener('mouseup', function mouseup() {
            assert.ok(true, 'mouseup has been fired');
        });

        pointerEvents.tapOn(button, function() {
            assert.ok(true, 'callback has been fired');
            QUnit.start();
        });
    });

    QUnit.asyncTest('triggers interact tap event', function(assert){
        QUnit.expect(2);

        var button = document.getElementById('button');
        interact(button).on('tap', function tap() {
            assert.ok(true, 'tap has been triggered');
        });

        pointerEvents.tapOn(button, function() {
            assert.ok(true, 'callback has been fired');
            QUnit.start();
        });
    });

    module('tapOn()');

});

