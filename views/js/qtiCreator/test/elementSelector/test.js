require([
    'lodash',
    'jquery',
    'taoQtiItem/qtiCreator/editor/elementSelector/selector'
], function(_, $, selector){

    test('init dialog', function(){

        expect(0);
        
        var $container = $('#item-editor-panel');
        selector.init({
            attachTo : $('#center1'),
            container : $container
        });
        selector.init({
            attachTo : $('#center2'),
            container : $container
        });
        selector.init({
            attachTo : $('#center3'),
            container : $container
        });
    });

});