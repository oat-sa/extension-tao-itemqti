define([
    'lodash',
    'taoQtiItem/qtiItem/helper/xincludeLoader',
    'taoQtiItem/qtiItem/core/Include'
], function(_, xincludeLoader, Include){

    QUnit.test('loading success', function(assert){
        var ready = assert.async();
        var baseUrl = 'taoQtiItem/test/samples/qtiv2p1/associate_include/';
        var xinclude = new Include();
        xinclude.attr('href','stimulus.xml');
        
        xincludeLoader.load(xinclude, baseUrl, function(xi, data){
            
            assert.ok(data.body.body, 'has body');
            assert.equal(_.size(data.body.elements), 2, 'elment img loaded');
            assert.equal(xi.qtiClass, 'include', 'qtiClass ok');
            ready();
            
        });
        
    });
    QUnit.test('loading failure', function(assert){
        var ready = assert.async();
        var baseUrl = 'taoQtiItem/test/samples/qtiv2p1/associate_include/';
        var xinclude = new Include();
        xinclude.attr('href','stimulus0.xml');
        
        xincludeLoader.load(xinclude, baseUrl, function(xi, data){
            
            assert.equal(data, false, 'loading failure detected');
            ready();
            
        });
        
    });

});