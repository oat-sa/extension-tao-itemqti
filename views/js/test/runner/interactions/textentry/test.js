define( [

    "jquery",
    "lodash",
    "taoQtiItem/runner/qtiItemRunner",
    "json!taoQtiItem/test/samples/json/richardIII-2.json"
], function(  $, _, qtiItemRunner, itemData ) {
    "use strict";

    var runner;
    var containerId = "item-container";

    QUnit.module( "Init", {
        undefined: function( assert ) {
            if ( runner ) {
                runner.clear();
            }
        }
    } );

    QUnit.test( "Item data loading", function( assert ) {
        var ready = assert.async();
        assert.expect( 2 );

        runner = qtiItemRunner( "qti", itemData )
          .on( "init", function() {

            assert.ok( typeof this._item === "object", "The item data is loaded and mapped to an object" );
            assert.ok( typeof this._item.bdy === "object", "The item contains a body object" );

            ready();
          } ).init();
    } );

    QUnit.module( "Render", {
        undefined: function( assert ) {
            if ( runner ) {
                runner.clear();
            }
        }
    } );

    QUnit.test( "Item rendering", function( assert ) {
        var ready = assert.async();
        assert.expect( 3 );

        var container = document.getElementById( containerId );

        assert.ok( container instanceof HTMLElement, "the item container exists" );
        assert.equal( container.children.length, 0, "the container has no children" );

        runner = qtiItemRunner( "qti", itemData )
            .on( "render", function() {

                assert.equal( container.children.length, 1, "the container has children" );

                ready();
            } )
            .init()
            .render( container );
    } );

    QUnit.module( "Clear" );

    QUnit.test( "Clear Item", function( assert ) {
        var ready = assert.async();
        assert.expect( 4 );

        var container = document.getElementById( containerId );

        assert.ok( container instanceof HTMLElement, "the item container exists" );
        assert.equal( container.children.length, 0, "the container has no children" );

        runner = qtiItemRunner( "qti", itemData )
            .on( "render", function() {
                assert.equal( container.children.length, 1, "the container has children" );

                this.clear();

            } ).on( "clear", function() {

                assert.equal( container.children.length, 0, "the container children are removed" );

                ready();
            } )
            .init()
            .render( container );
    } );

    QUnit.module( "State", {
        undefined: function( assert ) {
            if ( runner ) {
                runner.clear();
            }
        }
    } );

    QUnit.test( "get state after changes", function( assert ) {
        var ready = assert.async();
        assert.expect( 12 );

        $( "#item-container" ).remove();
        $( "#qunit-fixture" ).append( '<div id="item-container"></div>' );
        var container = document.getElementById( containerId );

        assert.ok( container instanceof HTMLElement, "the item container exists" );

        runner = qtiItemRunner( "qti", itemData )
            .on( "error", function( e ) {
                console.error( e );
            } )
            .on( "render", function() {

                //Default state
                var state  = this.getState();

                assert.ok( typeof state === "object", "the state is an object" );
                assert.ok( typeof state.RESPONSE === "object", "the state contains the interaction response identifier" );
                assert.equal( state.RESPONSE.response.base.string, "", "the default state contains an empty string" );

                //Change something
                $( "input.qti-textEntryInteraction", $( container ) ).val( "foo" ).trigger( "change" );

                state  = this.getState();

                assert.ok( typeof state === "object", "the state is an object" );
                assert.ok( typeof state.RESPONSE === "object", "the state contains the interaction response identifier" );
                assert.ok( typeof state.RESPONSE.response.base === "object", "the contains a base object" );
                assert.equal( state.RESPONSE.response.base.string, "foo", "the contains the entered string" );

                //Change something else
                $( "input.qti-textEntryInteraction", $( container ) ).val( "bar" ).trigger( "change" );

                state  = this.getState();

                assert.ok( typeof state === "object", "the state is an object" );
                assert.ok( typeof state.RESPONSE === "object", "the state contains the interaction response identifier" );
                assert.ok( typeof state.RESPONSE.response.base === "object", "the contains a base object" );
                assert.equal( state.RESPONSE.response.base.string, "bar", "the contains the entered string" );

                ready();
            } )
            .init()
            .render( container );
    } );

    QUnit.test( "set state", function( assert ) {
        var ready = assert.async();
        assert.expect( 3 );

        var container = document.getElementById( containerId );

        assert.ok( container instanceof HTMLElement, "the item container exists" );

        runner = qtiItemRunner( "qti", itemData )
            .on( "render", function() {

                assert.equal( $( "input.qti-textEntryInteraction", $( container ) ).val(), "", "The current value is empty" );

                this.setState( { RESPONSE: { response: { base: { string: "beebop" } } } } );

                assert.equal( $( "input.qti-textEntryInteraction", $( container ) ).val(), "beebop", "The current value matches the given state" );

                ready();
            } )
            .init()
            .render( container );
    } );

    QUnit.test( "set multiple  states", function( assert ) {
        var ready = assert.async();
        assert.expect( 5 );

        var container = document.getElementById( containerId );

        assert.ok( container instanceof HTMLElement, "the item container exists" );

        runner = qtiItemRunner( "qti", itemData )
            .on( "render", function() {

                //Default state
                assert.equal( $( "input.qti-textEntryInteraction", $( container ) ).val(), "", "The current value is empty" );

                //Set state
                this.setState( { RESPONSE: { response:  { base: { string: "bidiboop" } } } } );
                assert.equal( $( "input.qti-textEntryInteraction", $( container ) ).val(), "bidiboop", "The current value matches the given state" );

                 //Change something
                $( "input.qti-textEntryInteraction", $( container ) ).val( "babar" ).trigger( "change" );
                assert.equal( $( "input.qti-textEntryInteraction", $( container ) ).val(), "babar", "The current value matches the given state" );

                //Change a new time the state
                this.setState( { RESPONSE: { response: { base: { string: "badabeloowap" } } } } );
                assert.equal( $( "input.qti-textEntryInteraction", $( container ) ).val(), "badabeloowap", "The current value matches the given state" );

                ready();
            } )
            .init()
            .render( container );
    } );

    QUnit.test( "listen state changes", function( assert ) {
        var ready = assert.async();
        assert.expect( 9 );

        var container = document.getElementById( containerId );

        assert.ok( container instanceof HTMLElement, "the item container exists" );

        runner = qtiItemRunner( "qti", itemData )
            .on( "statechange", function( state ) {

                assert.equal( $( "input.qti-textEntryInteraction", $( container ) ).val(), "woopsy", "The current value matches the given state" );

                assert.ok( typeof state === "object", "the state is an object" );
                assert.ok( typeof state.RESPONSE === "object", "the state contains the interaction response identifier" );
                assert.ok( typeof state.RESPONSE.response.base === "object", "the contains a base object" );
                assert.equal( state.RESPONSE.response.base.string, "woopsy", "the contains the entered string" );

                ready();
            } )
            .on( "render", function() {
                var state  = this.getState();

                assert.ok( typeof state === "object", "the state is an object" );
                assert.ok( typeof state.RESPONSE === "object", "the state contains the interaction response identifier" );
                assert.equal( state.RESPONSE.response.base.string, "", "the default state contains an empty string" );

                $( "input.qti-textEntryInteraction", $( container ) ).val( "woopsy" ).trigger( "keyup" );

            } )
            .init()
            .render( container );
    } );

    QUnit.module( "Get responses", {
        undefined: function( assert ) {
            if ( runner ) {
                runner.clear();
            }
        }
    } );

    QUnit.test( "no responses set", function( assert ) {
        var ready = assert.async();
        assert.expect( 4 );

        var container = document.getElementById( containerId );

        assert.ok( container instanceof HTMLElement, "the item container exists" );

        runner = qtiItemRunner( "qti", itemData )
            .on( "render", function() {
                var responses  = this.getResponses();

                assert.ok( typeof responses === "object", "the response is an object" );
                assert.ok( typeof responses.RESPONSE === "object", "the response contains the interaction response identifier" );
                assert.equal( responses.RESPONSE.base.string, "", "the response contains an empty string" );

                ready();
            } )
            .init()
            .render( container );
    } );

    QUnit.test( "get responses after changes", function( assert ) {
        var ready = assert.async();
        assert.expect( 7 );

        var container = document.getElementById( containerId );

        assert.ok( container instanceof HTMLElement, "the item container exists" );

        runner = qtiItemRunner( "qti", itemData )
            .on( "render", function() {
                var responses  = this.getResponses();

                assert.ok( typeof responses === "object", "the response is an object" );
                assert.ok( typeof responses.RESPONSE === "object", "the response contains the interaction response identifier" );
                assert.equal( responses.RESPONSE.base.string, "", "the response contains an empty string" );

                //The user set response
                $( "input.qti-textEntryInteraction", $( container ) ).val( "kisscool" ).trigger( "change" );

                responses = this.getResponses();

                assert.ok( typeof responses === "object", "the response is an object" );
                assert.ok( typeof responses.RESPONSE === "object", "the response contains the interaction response identifier" );
                assert.equal( responses.RESPONSE.base.string, "kisscool", "the default state contains an empty string" );

                ready();
            } )
            .init()
            .render( container );
    } );

} );

