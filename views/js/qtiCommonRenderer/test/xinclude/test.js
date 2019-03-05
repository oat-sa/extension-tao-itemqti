define(['taoQtiItem/qtiCommonRenderer/test/runner', 'lodash', 'taoQtiItem/qtiItem/helper/xincludeLoader'], function (runner, _, xincludeLoader){
    QUnit.start();

    QUnit.module('xinclude');

    QUnit.test('runner', function (assert) {
        var ready = assert.async();
        var baseUrl = 'taoQtiItem/test/samples/qtiv2p1/associate_include/';
        runner.run({
            relBaseUrl : baseUrl,
            callback : function (item, renderer){

                var xincludes = _.values(item.getElements('include'));

                assert.equal(xincludes.length, 1, 'xinclude found');
                var xinclude = xincludes[0];

                xincludeLoader.load(xinclude, baseUrl, function (xi, data, loadedClasses){
                    renderer.load(function (){


                        assert.ok(data.body.body, 'has body');
                        assert.equal(_.size(data.body.elements), 2, 'elment img & math loaded');
                        assert.equal(xi.qtiClass, 'include', 'qtiClass ok');

                        item.render(item.getContainer());
                        item.postRender();
                        ready();

                    }, loadedClasses);
                });
            }
        });
    });
});


