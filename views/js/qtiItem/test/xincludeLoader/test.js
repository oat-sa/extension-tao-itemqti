require([
    'lodash',
    'taoQtiItem/qtiItem/helper/xincludeLoader',
    'taoQtiItem/qtiItem/core/Include'
], function(_, xincludeLoader, Include){

    QUnit.test('load', function(){
        
        QUnit.stop();
        
        var baseUrl = 'taoQtiItem/test/samples/qtiv2p1/associate_include/';
        var xinclude = new Include();
        xinclude.attr('href','stimulus.xml');
        
        xincludeLoader.load(xinclude, baseUrl, function(xi, data){
            
            QUnit.start();
            QUnit.ok(data.body.body, 'has body');
            QUnit.equal(_.size(data.body.elements), 1, 'elment img loaded');
            QUnit.equal(xi.qtiClass, 'include', 'qtiClass ok');
            
            console.log(xi, data);
        });
        
    });

});