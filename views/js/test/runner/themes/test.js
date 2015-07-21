define([
    'jquery',
    'taoQtiItem/runner/themes/loader',
], function($, themeLoader){

    var config = {
        base : 'base.css',
        default : 'blue',
        available : [{
            id   : 'blue',
            path : 'blue.css',
            name : 'Blue'
        }, {
            id : 'green',
            path : 'green.css',
            name : 'Green'
        }
    ]};

    var pink = 'rgb(255, 192, 203)';
    var blue = 'rgb(0, 0, 255)';
    var green= 'rgb(0, 128, 0)';

    QUnit.module('Theme Loader API');

    QUnit.test('module', function(assert){
        assert.ok(typeof themeLoader !== 'undefined', 'The module exports something');
        assert.ok(typeof themeLoader === 'function', 'The module exports a function');
    });

    QUnit.test('config format', function(assert){

        assert.throws(function(){
            themeLoader();
        }, TypeError, 'A config parameter is required');

        assert.throws(function(){
            themeLoader({});
        }, TypeError, 'A config parameter with a base property is required');

        assert.throws(function(){
            themeLoader({
                base : ''
            });
        }, TypeError, 'A config parameter with available themes property is required');

        assert.throws(function(){
            themeLoader({
                base : '',
                available : [{}]
            });
        }, TypeError, 'Themes should contain path and id');

        //does not fail
        themeLoader(config);
    });


    QUnit.test('loader api', function(assert){
        var loader = themeLoader(config);

        assert.ok(typeof loader === 'object', 'The theme loader returns an object');
        assert.ok(typeof loader.load === 'function', 'The loader exposes a method load');
        assert.ok(typeof loader.unload === 'function', 'The loader exposes a method unload');
        assert.ok(typeof loader.change === 'function', 'The loader exposes a method change');

    });

    QUnit.module('Theme loading', {
        teardown: function(){
            $('head').find('link[data-type^="qti-item-style"]').remove();
        }
    });


    QUnit.asyncTest('load', 5, function(assert){
        var loader = themeLoader(config);
        var $container = $('#qti-item');
        assert.equal($container.length, 1, 'The container exists');

        loader.load();
        setTimeout(function(){

            var $styleSheets = $('link[data-type^="qti-item-style"]');
            assert.ok($styleSheets.length > 0, 'The styleSheets have been inserted');
            assert.equal($styleSheets.length, 3, 'All styleSheets have been inserted');

            assert.equal($container.css('background-color'), pink, 'The base style is loaded and computed');
            assert.equal($container.css('color'), blue, 'The theme style is loaded and computed');

            QUnit.start();
        }, 50);
    });


    QUnit.asyncTest('unload', 11, function(assert){
        var loader = themeLoader(config);
        var $container = $('#qti-item');
        assert.equal($container.length, 1, 'The container exists');

        loader.load();
        setTimeout(function(){

            var $styleSheets = $('link[data-type^="qti-item-style"]');
            assert.ok($styleSheets.length > 0, 'The styleSheets have been inserted');
            assert.equal($styleSheets.length, 3, 'All styleSheets have been inserted');

            assert.equal($container.css('background-color'), pink, 'The base style is loaded and computed');
            assert.equal($container.css('color'), blue, 'The theme style is loaded and computed');

            loader.unload();

            setTimeout(function(){

                assert.equal($('link[data-type^="qti-item-style"]').length, 3, 'The stylesheets are still there');
                assert.ok($('link[data-id="base"]').prop('disabled'), 'The base stylesheet is disabled');
                assert.ok($('link[data-id="green"]').prop('disabled'), 'The green stylesheet is disabled');
                assert.ok($('link[data-id="blue"]').prop('disabled'), 'The blue stylesheet is disabled');

                assert.notEqual($container.css('background-color'), pink, 'The base style is  unloaded');
                assert.notEqual($container.css('color'), blue, 'The theme style is unloaded');

                QUnit.start();
            }, 10);
        }, 50);
    });


    QUnit.asyncTest('change', 8, function(assert){
        var loader = themeLoader(config);
        var $container = $('#qti-item');
        assert.equal($container.length, 1, 'The container exists');

        loader.load();
        setTimeout(function(){

            var $styleSheets = $('link[data-type^="qti-item-style"]');
            assert.ok($styleSheets.length > 0, 'The styleSheets have been inserted');
            assert.equal($styleSheets.length, 3, 'All styleSheets have been inserted');

            assert.equal($container.css('background-color'), pink, 'The base style is loaded and computed');
            assert.equal($container.css('color'), blue, 'The theme style is loaded and computed');

            loader.change('green');

            setTimeout(function(){

                assert.equal($container.css('background-color'), pink, 'The base style is still loaded');
                assert.equal($container.css('color'), green, 'The new theme style is loaded and computed');
                assert.equal(loader.getActiveTheme(), 'green', 'The new theme became the active theme');

                QUnit.start();
            }, 50);
        }, 50);
    });


    QUnit.asyncTest('change back to default', 10, function(assert){
        var loader = themeLoader(config);
        var $container = $('#qti-item');
        assert.equal($container.length, 1, 'The container exists');

        loader.load();
        setTimeout(function(){

            var $styleSheets = $('link[data-type^="qti-item-style"]');
            assert.ok($styleSheets.length > 0, 'The styleSheets have been inserted');
            assert.equal($styleSheets.length, 3, 'All styleSheets have been inserted');

            assert.equal($container.css('background-color'), pink, 'The base style is loaded and computed');
            assert.equal($container.css('color'), blue, 'The theme style is loaded and computed');

            loader.change('green');

            setTimeout(function(){

                assert.equal($container.css('background-color'), pink, 'The base style is still loaded');
                assert.equal($container.css('color'), green, 'The new theme style is loaded and computed');

                loader.change('default');


                setTimeout(function(){

                    assert.equal($container.css('background-color'), pink, 'The base style is loaded and computed');
                    assert.equal($container.css('color'), blue, 'The default theme style is loaded');
                    assert.equal(loader.getActiveTheme(), 'blue', 'The active theme has been reset to default');

                    QUnit.start();
                }, 50);
            }, 50);
        }, 50);
    });

    QUnit.asyncTest('reload and change', 15, function(assert){
        var loader = themeLoader(config);
        var $container = $('#qti-item');
        assert.equal($container.length, 1, 'The container exists');

        loader.load();
        setTimeout(function(){

            var $styleSheets = $('link[data-type^="qti-item-style"]');
            assert.ok($styleSheets.length > 0, 'The styleSheets have been inserted');
            assert.equal($styleSheets.length, 3, 'All styleSheets have been inserted');

            assert.equal($container.css('background-color'), pink, 'The base style is loaded and computed');
            assert.equal($container.css('color'), blue, 'The theme style is loaded and computed');

            loader.unload();

            setTimeout(function(){
                assert.equal($('link[data-type^="qti-item-style"]').length, 3, 'The stylesheets are stil there');
                assert.ok($('link[data-id="base"]').prop('disabled'), 'The base stylesheet is disabled');
                assert.ok($('link[data-id="blue"]').prop('disabled'), 'The blue stylesheet is disabled');
                assert.ok($('link[data-id="green"]').prop('disabled'), 'The green stylesheet is disabled');

                var loader2 = themeLoader(config);
                loader2.load();

                setTimeout(function(){

                    assert.ok( ! $('link[data-id="base"]').prop('disabled'), 'The base stylesheet is now enabled');
                    assert.ok( ! $('link[data-id="blue"]').prop('disabled'), 'The blue stylesheet is now enabled');
                    assert.ok($('link[data-id="green"]').prop('disabled'), 'The green stylesheet is disabled');

                    loader2.change('green');

                    setTimeout(function(){

                        assert.equal($container.css('background-color'), pink, 'The base style is still loaded');
                        assert.equal($container.css('color'), green, 'The new theme style is loaded and computed');
                        assert.equal(loader2.getActiveTheme(), 'green', 'The new theme became the active theme');

                        QUnit.start();

                    }, 50);
                }, 50);
            }, 50);
        }, 50);
    });


});
