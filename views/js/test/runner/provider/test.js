define([
    'jquery', 
    'lodash', 
    'taoItems/runner/api/itemRunner', 
    'taoQtiItem/runner/provider/qti',
    'json!taoQtiItem/test/runner/samples/space-shuttle'], function($, _, itemRunner, qtiRuntimeProvider, itemData){

    var container = document.getElementById('outside-container');

    QUnit.module('Provider API');
   
    QUnit.test('module', function(assert){
        assert.ok(typeof qtiRuntimeProvider !== 'undefined', "The module exports something");
        assert.ok(typeof qtiRuntimeProvider === 'object', "The module exports an object");
        assert.ok(typeof qtiRuntimeProvider.init === 'function' || typeof qtiRuntimeProvider.render === 'function', "The provider expose an init or a render method");
    });


    QUnit.module('Register the provider', {
        teardown : function(){
            //reset the provider
            itemRunner.providers = undefined;
        }
    });

    QUnit.test('register the qti provider', function(assert){
        QUnit.expect(4);
        
        assert.ok(typeof itemRunner.providers === 'undefined', 'the runner has no providers');

        itemRunner.register('qti', qtiRuntimeProvider);

        assert.ok(typeof itemRunner.providers === 'object', 'the runner has now providers');
        assert.ok(typeof itemRunner.providers.qti === 'object', 'the runner has now the qti providers');
        assert.equal(itemRunner.providers.qti, qtiRuntimeProvider, 'the runner has now the qti providers');

    });


    module('Provider init', {
        teardown : function(){
            //reset the provides
            itemRunner.providers = undefined;
        }
    });

    QUnit.asyncTest('Item data loading', function(assert){
        QUnit.expect(2);
        
        itemRunner.register('qti', qtiRuntimeProvider);


        itemRunner('qti', itemData)
          .on('init', function(){
            
            assert.ok(typeof this._item === 'object', 'The item data is loaded and mapped to an object');
            assert.ok(typeof this._item.bdy === 'object', 'The item contains a body object');

            QUnit.start();
          }).init();
    });


// itemRunner().render()

    module('Provider render', {
        teardown : function(){
            //reset the provides
            itemRunner.providers = undefined;
        }
    });

    QUnit.asyncTest('Item rendering', function(assert){
        QUnit.expect(3);
       
        assert.ok(container instanceof HTMLElement , 'the item container exists');
        assert.equal(container.childNodes.length, 0, 'the container has no children');
 
        itemRunner.register('qti', qtiRuntimeProvider);

        itemRunner('qti', itemData)
        .on('init', function(){
            this.render(container);
        })
        .on('render', function(){
            
            assert.equal(container.childNodes.length, 1, 'the container has now children');

            QUnit.start();
        })
        .init();
    });


/*
    module('ItemRunner init', {
        teardown : function(){
            //reset the provides
            itemRunner.providers = undefined;
        }
    });

    QUnit.asyncTest('Initialize the runner', function(assert){
        QUnit.expect(4);
        
        assert.throws(function(){
            itemRunner('dummyProvider', {});
        }, Error, 'An error is thrown when no provider is set');

        itemRunner.register('dummyProvider', dummyProvider);

        assert.throws(function(){
            itemRunner('zoommyProvider', {});
        }, Error, 'An error is thrown when requesting the wrong provider');

        itemRunner('dummyProvider', {
            type: 'number'
        }).on('init', function(){
            
            assert.ok(typeof this._data === 'object', 'the itemRunner context got the data assigned');
            assert.equal(this._data.type, 'number', 'the itemRunner context got the right data assigned');

            QUnit.start();
        }).init();
    });

    QUnit.asyncTest('Get the default provider', function(assert){
        QUnit.expect(2);
        
        itemRunner.register('dummyProvider', dummyProvider);

        itemRunner({
            type: 'number'
        }).on('init', function(){
            
            assert.ok(typeof this._data === 'object', 'the itemRunner context got the data assigned');
            assert.equal(this._data.type, 'number', 'the itemRunner context got the right data assigned');

            QUnit.start();
        }).init();
    });

    QUnit.asyncTest('Initialize the item with new data', function(assert){
        QUnit.expect(2);
        
        itemRunner.register('dummyProvider', dummyProvider);

        itemRunner('dummyProvider', {
            type: 'number'
        }).on('init', function(){
            
            assert.ok(typeof this._data === 'object', 'the itemRunner context got the data assigned');
            assert.equal(this._data.type, 'text', 'the itemRunner context got the right data assigned');

            QUnit.start();
        }).init({
            type : 'text'
        });
    });


    QUnit.asyncTest('No init in the provider', function(assert){
        QUnit.expect(1);
       
        itemRunner.register('dummyProvider', _.omit(dummyProvider, 'init'));

        var runner = itemRunner('dummyProvider', {
            type: 'search'
        }).on('init', function(){

            assert.ok(true, 'init is still called');

            QUnit.start();
        })
        .init();
    });


// itemRunner().render()

    module('ItemRunner render', {
        teardown : function(){
            //reset the provides
            itemRunner.providers = undefined;
        }
    });

    QUnit.asyncTest('Render an item from an HTMLElement', function(assert){
        QUnit.expect(5);
       
        var container = document.getElementById('item-container');
        assert.equal(container.id, 'item-container', 'the item container exists');
        assert.equal(container.childNodes.length, 0, 'the container has no children');
 
        itemRunner.register('dummyProvider', dummyProvider);

        itemRunner('dummyProvider', {
            type: 'number'
        }).on('render', function(){
            
            assert.ok(typeof this._data === 'object', 'the itemRunner context got the data assigned');
            assert.equal(this._data.type, 'number', 'the itemRunner context got the right data assigned');

            assert.equal(container.childNodes.length, 1, 'the container has now children');

            QUnit.start();
        })
        .init()
        .render(container);
    });

    QUnit.asyncTest('Render an item from a jQueryElement', function(assert){
        QUnit.expect(4);
       
        var $container = $('#item-container');
        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($('input', $container).length, 0, 'the container does not contains an input');
 
        itemRunner.register('dummyProvider', dummyProvider);

        var runner = itemRunner('dummyProvider', {
            type: 'search'
        }).on('render', function(){
            var $input = $('input', $container);
            assert.equal($input.length, 1, 'the container contains an input');
            assert.equal($input.attr('type'), 'search', 'the input has the right type');

            QUnit.start();
        })
        .init()
        .render($container);
    });

    QUnit.asyncTest('Render an item into wrong element', function(assert){
        QUnit.expect(2);
       
        itemRunner.register('dummyProvider', dummyProvider);

        itemRunner('dummyProvider', {
            type: 'search'
        }).on('error', function(message){
            assert.ok(typeof message === 'string', 'An error message is given');
            assert.ok(message.length > 0 , 'A non empty message is given');
            QUnit.start();
        })
        .init()
        .render("item-container");
    });

    QUnit.asyncTest('Render an item without element', function(assert){
        QUnit.expect(2);
       
        itemRunner.register('dummyProvider', dummyProvider);

        itemRunner('dummyProvider', {
            type: 'search'
        }).on('error', function(message){
            assert.ok(typeof message === 'string', 'An error message is given');
            assert.ok(message.length > 0 , 'A non empty message is given');
            QUnit.start();
        })
        .init()
        .render();
    });

    QUnit.asyncTest('No clear in the provider', function(assert){
        QUnit.expect(1);
       
        var $container = $('#item-container');

        itemRunner.register('dummyProvider', _.omit(dummyProvider, 'render'));

        var runner = itemRunner('dummyProvider', {
            type: 'search'
        }).on('render', function(){

            assert.ok(true, 'render is still called');

            QUnit.start();
        })
        .init()
        .render($container);
    });


// itemRunner().clear()

    module('ItemRunner clear', {
        teardown : function(){
            //reset the provides
            itemRunner.providers = undefined;
        }
    });

    QUnit.asyncTest('Clear a rendered element', function(assert){
        QUnit.expect(4);
       
        var $container = $('#item-container');
        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');
 
        itemRunner.register('dummyProvider', dummyProvider);

        var runner = itemRunner('dummyProvider', {
            type: 'search'
        }).on('render', function(){
            assert.equal($container.children().length, 1, 'the container has a child');

            this.clear();

        }).on('clear', function(){

            assert.equal($container.children().length, 0, 'the container children are removed');

            QUnit.start();
        })
        .init()
        .render($container);
    });

    QUnit.asyncTest('No clear in the provider', function(assert){
        QUnit.expect(1);
       
        var $container = $('#item-container');

         
        itemRunner.register('dummyProvider', _.omit(dummyProvider, 'clear'));

        var runner = itemRunner('dummyProvider', {
            type: 'search'
        }).on('render', function(){

            this.clear();

        }).on('clear', function(){

            assert.ok(true, 'clear is still called');

            QUnit.start();
        })
        .init()
        .render($container);
    });


// itemRunner().get/setState() 
//             .on('statechange')

    module('ItemRunner state', {
        teardown : function(){
            //reset the provides
            itemRunner.providers = undefined;
        }
    });

    QUnit.asyncTest('setState after render', function(assert){
        QUnit.expect(4);
       
        var $container = $('#item-container');
        assert.equal($container.length, 1, 'the item container exists');
 
        itemRunner.register('dummyProvider', dummyProvider);

        var runner = itemRunner('dummyProvider', {
            type: 'number',
            value : 0
        }).on('render', function(){
            var $input = $('input', $container);
            assert.equal($input.length, 1, 'the container contains an input');
            assert.equal($input.val(), 0, 'the input value is set before');

            this.setState({ value : 12 }); 

            assert.equal($input.val(), 12, 'the input value has changed regarding to the state');

            QUnit.start();
        })
        .init()
        .render($container);
    });

    QUnit.asyncTest('set initial state', function(assert){
        QUnit.expect(3);
       
        var $container = $('#item-container');
        assert.equal($container.length, 1, 'the item container exists');
 
        itemRunner.register('dummyProvider', dummyProvider);

        var runner = itemRunner('dummyProvider', {
            type: 'number'
        }).on('render', function(){
            var $input = $('input', $container);
            assert.equal($input.length, 1, 'the container contains an input');
            assert.equal($input.val(), 13, 'the input value has the initial state');

            QUnit.start();
        })
        .init()
        .setState({ value : 13 })
        .render($container);
    });

    QUnit.asyncTest('set a wrong state', function(assert){
        QUnit.expect(2);
       
        itemRunner.register('dummyProvider', dummyProvider);

        var runner = itemRunner('dummyProvider', {
            type: 'number',
            value : 0
        })
        .on('error', function(message){
            assert.ok(typeof message === 'string', 'An error message is given');
            assert.ok(message.length > 0 , 'A non empty message is given');
            QUnit.start();
        })
        .init()
        .setState([]);
    });

    QUnit.asyncTest('get the current state', function(assert){
        QUnit.expect(7);
       
        var $container = $('#item-container');
        assert.equal($container.length, 1, 'the item container exists');
 
        itemRunner.register('dummyProvider', dummyProvider);

        var runner = itemRunner('dummyProvider', {
            type: 'number',
            value : 0
        }).on('render', function(){
            var state;
            var $input = $('input', $container);
            assert.equal($input.length, 1, 'the container contains an input');
            assert.equal($input.val(), 0, 'the input value is set before');

            state = this.getState();
            
            assert.ok(typeof state === 'object' , 'the state is an object');
            assert.equal(state.value, 0, 'got the initial state');

            $input.val(14);

            state = this.getState();

            assert.ok(typeof state === 'object', 'the state is an object');
            assert.equal(state.value, 14, 'got the last state value');

            QUnit.start();
        })
        .init()
        .render($container);
    });
    
    QUnit.asyncTest('listen for state change', function(assert){
        QUnit.expect(5);
       
        var $container = $('#item-container');
        assert.equal($container.length, 1, 'the item container exists');
 
        itemRunner.register('dummyProvider', dummyProvider);

        var runner = itemRunner('dummyProvider', {
            type: 'number',
            value : 0
        }).on('statechange', function(state){

            var $input = $('input', $container);
           
            assert.ok(typeof state === 'object' , 'the state is an object');
            assert.equal($input.length, 1, 'the container contains an input');
            assert.equal(state.value, 16, 'the state has the updated value');
            assert.equal($input.val(), state.value, 'the given state match the input value');

            QUnit.start();
        }).on('render', function(){
            var $input = $('input', $container);
            $input.val(16)[0].dispatchEvent(new Event('change'));
        })
        .init()
        .render($container);
    });


// itemRunner().getResponses

    module('ItemRunner getResponses', {
        teardown : function(){
            //reset the provides
            itemRunner.providers = undefined;
        }
    });

    QUnit.asyncTest('getResponses with no changes', function(assert){
        QUnit.expect(4);
       
        var $container = $('#item-container');
        assert.equal($container.length, 1, 'the item container exists');
 
        itemRunner.register('dummyProvider', dummyProvider);

        var runner = itemRunner('dummyProvider', {
            type: 'number',
            value : 0
        }).on('render', function(){

            var responses = this.getResponses();
            
            assert.ok(responses instanceof Array, 'responses is an array');
            assert.equal(responses.length, 1, 'responses contains one entry');
            assert.equal(responses[0], 0, 'response is the initial value');

            QUnit.start();
        })
        .init()
        .render($container);
    });

    QUnit.asyncTest('getResponses after changes', function(assert){
        QUnit.expect(4);
       
        var $container = $('#item-container');
        assert.equal($container.length, 1, 'the item container exists');
 
        itemRunner.register('dummyProvider', dummyProvider);

        var runner = itemRunner('dummyProvider', {
            type: 'number',
            value : 0
        }).on('render', function(){

            var $input = $('input', $container);
            $input.val(18);

            var responses = this.getResponses();
            
            assert.ok(responses instanceof Array, 'responses is an array');
            assert.equal(responses.length, 1, 'responses contains one entry, the last response only');
            assert.equal(responses[0], 18, 'response is the initial value');

            QUnit.start();
        })
        .init()
        .render($container);
    });

// itemRunner().on().off().trigger()

    module('ItemRunner events', {
        teardown : function(){
            //reset the provides
            itemRunner.providers = undefined;
        }
    });
    
    QUnit.asyncTest('multiple events binding', function(assert){
        QUnit.expect(2);
       
        var inc = 0;
 
        itemRunner.register('dummyProvider', dummyProvider);

        var runner = itemRunner('dummyProvider', {
            type: 'number'
        }).on('test', function(){
            assert.equal(inc, 0, 'handler called first');
            inc++;
        }).on('test', function(){
            assert.equal(inc, 1, 'first called 2nd');
            QUnit.start();
        })
        .init()
        .trigger('test');
    });

    QUnit.asyncTest('unbinding events', function(assert){
        QUnit.expect(1);
       
        var inc = 0;
 
        itemRunner.register('dummyProvider', dummyProvider);

        var runner = itemRunner('dummyProvider', {
            type: 'number'
        }).on('test', function(){
            assert.ok(false, 'Should not be called');
        }).on('test', function(){
            assert.ok(false, 'should not be callled');
        })
        .init()
        .off('test')
        .trigger('test');

        setTimeout(function(){
            assert.ok(true, 'handlers not called after off');
            QUnit.start();
        }, 10);
    });
*/
});

