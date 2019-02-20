define( [

    "jquery",
    "lodash",
    "taoQtiItem/runner/qtiItemRunner",
    "core/mouseEvent",
    "ui/interactUtils",
    "json!taoQtiItem/test/qtiCommonRenderer/interactions/graphicGapMatch/sample.json"
], function(
   
    $,
    _,
    qtiItemRunner,
    triggerMouseEvent,
    interactUtils,
    gapMatchData
) {
    "use strict";

    var runner;
    var fixtureContainerId = "item-container";
    var outsideContainerId = "outside-container";

    //Override asset loading in order to resolve it from the runtime location
    var strategies = [ {
        name: "default",
        handle: function defaultStrategy( url ) {
            if ( /assets/.test( url.toString() ) ) {
                return "../../taoQtiItem/views/js/test/qtiCommonRenderer/interactions/graphicGapMatch/" + url.toString();
            }
            return url.toString();
        }
    } ];

    QUnit.module( "Graphic GapMatch Interaction", {
        undefined: function( assert ) {
            if ( runner ) {
                runner.clear();
            }
        }
    } );

    QUnit.test( "renders correctly", function( assert ) {
        var ready = assert.async();
        assert.expect( 20 );

        var $container = $( "#" + fixtureContainerId );

        assert.equal( $container.length, 1, "the item container exists" );
        assert.equal( $container.children().length, 0, "the container has no children" );

        runner = qtiItemRunner( "qti", gapMatchData )
            .on( "render", function() {

                //Check DOM
                assert.equal( $container.children().length, 1, "the container a elements" );
                assert.equal( $container.children( ".qti-item" ).length, 1, "the container contains a the root element .qti-item" );
                assert.equal( $container.find( ".qti-itemBody" ).length, 1, "the container contains a the body element .qti-itemBody" );
                assert.equal( $container.find( ".qti-interaction" ).length, 1, "the container contains an interaction .qti-interaction" );
                assert.equal( $container.find( ".qti-interaction.qti-graphicGapMatchInteraction" ).length, 1, "the container contains a choice interaction .qti-graphicGapMatchInteraction" );
                assert.equal( $container.find( ".qti-graphicGapMatchInteraction .qti-prompt-container" ).length, 1, "the interaction contains a prompt" );
                assert.equal( $container.find( ".qti-graphicGapMatchInteraction .instruction-container" ).length, 1, "the interaction contains a instruction box" );
                assert.equal( $container.find( ".qti-graphicGapMatchInteraction .block-listing" ).length, 1, "the interaction contains a choice area" );
                assert.equal( $container.find( ".qti-graphicGapMatchInteraction .block-listing .qti-choice" ).length, 6, "the interaction has 6 choices" );
                assert.equal( $container.find( ".qti-graphicGapMatchInteraction .main-image-box" ).length, 1, "the interaction contains a image" );
                assert.equal( $container.find( ".qti-graphicGapMatchInteraction .main-image-box rect" ).length, 6, "the interaction contains 6 gaps" );

                //Check DOM data
                assert.equal( $container.children( ".qti-item" ).data( "identifier" ), "i1462375832429680", "the .qti-item node has the right identifier" );

                assert.equal( $container.find( ".qti-graphicGapMatchInteraction .block-listing .qti-choice" ).eq( 0 ).data( "identifier" ), "gapimg_1", "the 1st block has the right identifier" );
                assert.equal( $container.find( ".qti-graphicGapMatchInteraction .block-listing .qti-choice" ).eq( 1 ).data( "identifier" ), "gapimg_2", "the 2nd block has the right identifier" );
                assert.equal( $container.find( ".qti-graphicGapMatchInteraction .block-listing .qti-choice" ).eq( 2 ).data( "identifier" ), "gapimg_3", "the 3rd block has the right identifier" );
                assert.equal( $container.find( ".qti-graphicGapMatchInteraction .block-listing .qti-choice" ).eq( 3 ).data( "identifier" ), "gapimg_4", "the 4th block has the right identifier" );
                assert.equal( $container.find( ".qti-graphicGapMatchInteraction .block-listing .qti-choice" ).eq( 4 ).data( "identifier" ), "gapimg_5", "the 5th block has the right identifier" );
                assert.equal( $container.find( ".qti-graphicGapMatchInteraction .block-listing .qti-choice" ).eq( 5 ).data( "identifier" ), "gapimg_6", "the 6th block has the right identifier" );

                ready();
            } )
            .assets( strategies )
            .init()
            .render( $container );
    } );

    QUnit.test( "enables to activate a gap filler", function( assert ) {
        var ready = assert.async();
        assert.expect( 5 );

        var $container = $( "#" + fixtureContainerId );
        assert.equal( $container.length, 1, "the item container exists" );

        runner = qtiItemRunner( "qti", gapMatchData )
            .on( "render", function() {
                var $gapFiller = $( '.qti-choice[data-identifier="gapimg_1"]', $container );
                var $hotspot = $( ".main-image-box rect", $container ).eq( 5 );
                var borderColorInactive = "#8d949e";

                assert.ok( !$gapFiller.hasClass( "active" ), "The gap filler is not active" );
                assert.strictEqual( $hotspot.attr( "stroke" ), borderColorInactive, "The hotspot is not highlighted" );

                interactUtils.tapOn( $gapFiller, function() {
                    assert.ok( $gapFiller.hasClass( "active" ), "The gap filler is now active" );
                    assert.notStrictEqual( $hotspot.attr( "stroke" ), borderColorInactive, "The hotspot is now highlighted" );

                    ready();
                }, 200 ); // Safety delay for the border color to start changing, could be shortened by removing the animation
            } )
            .assets( strategies )
            .init()
            .render( $container );
    } );

    QUnit.test( "enables to fill a hotspot", function( assert ) {
        var ready = assert.async();
        assert.expect( 4 );

        var $container = $( "#" + fixtureContainerId );
        assert.equal( $container.length, 1, "the item container exists" );

        runner = qtiItemRunner( "qti", gapMatchData )
            .on( "render", function() {
                var $gapFiller = $( '.qti-choice[data-identifier="gapimg_1"]', $container );
                var $hotspot = $( ".main-image-box rect", $container ).eq( 5 );

                interactUtils.tapOn( $gapFiller, function() {
                    interactUtils.tapOn( $hotspot );
                }, 50 );
            } )
            .on( "statechange", function( state ) {
                assert.ok( typeof state === "object", "The state is an object" );
                assert.ok( typeof state.RESPONSE === "object", "The state has a response object" );
                assert.deepEqual( state.RESPONSE, { response: { list: { directedPair: [ [ "gapimg_1", "associablehotspot_6" ] ] } } }, "The pair is selected" );

                ready();
            } )
            .assets( strategies )
            .init()
            .render( $container );
    } );

    QUnit.test( "enables to fill a hotspot with two gap fillers", function( assert ) {
        var ready = assert.async();
        assert.expect( 3 );

        var stateChangeCounter = 0;
        var $container = $( "#" + fixtureContainerId );
        assert.equal( $container.length, 1, "the item container exists" );

        runner = qtiItemRunner( "qti", gapMatchData )
            .on( "render", function() {
                var $gapFiller = $( '.qti-choice[data-identifier="gapimg_1"]', $container );
                var $gapFiller2 = $( '.qti-choice[data-identifier="gapimg_3"]', $container );
                var $hotspot = $( ".main-image-box rect", $container ).eq( 5 );

                interactUtils.tapOn( $gapFiller, function() {
                    interactUtils.tapOn( $hotspot, function() {
                        interactUtils.tapOn( $gapFiller2, function() {

                            // We click on the image, but the click should be redirected to the underlying shape
                            var $gapFillerOnHotspot = $container.find( ".main-image-box image", $container ).eq( 1 );
                            interactUtils.tapOn( $gapFillerOnHotspot );

                        }, 10 );
                    }, 300 ); // We need to wait for the animation to end in order for the click event to be bound
                }, 10 );
            } )
            .on( "statechange", function( state ) {
                stateChangeCounter++;
                if ( stateChangeCounter === 1 ) {
                    assert.deepEqual(
                        state.RESPONSE,
                        { response: { list: { directedPair: [ [ "gapimg_1", "associablehotspot_6" ] ] } } },
                        "The first pair is selected" );

                } else if ( stateChangeCounter === 2 ) {
                    assert.deepEqual(
                        state.RESPONSE,
                        { response: { list: { directedPair: [ [ "gapimg_1", "associablehotspot_6" ], [ "gapimg_3", "associablehotspot_6" ] ] } } },
                        "The 2 pairs are selected" );

                    ready();
                }
            } )
            .assets( strategies )
            .init()
            .render( $container );
    } );

    QUnit.test( "enables to remove a gap filler", function( assert ) {
        var ready = assert.async();
        assert.expect( 4 );

        var stateChangeCounter = 0;
        var $container = $( "#" + fixtureContainerId );
        assert.equal( $container.length, 1, "the item container exists" );

        runner = qtiItemRunner( "qti", gapMatchData )
            .on( "render", function() {
                var $gapFiller = $( '.qti-choice[data-identifier="gapimg_1"]', $container );
                var $hotspot = $( ".main-image-box rect", $container ).eq( 5 );

                interactUtils.tapOn( $gapFiller, function() {
                    interactUtils.tapOn( $hotspot, function() {
                        var $gapFillerOnHotspot = $container.find( ".main-image-box image", $container ).eq( 1 );

                        interactUtils.tapOn( $gapFillerOnHotspot );

                         assert.equal(
                             $container.find( ".main-image-box image" ).length,
                             1, // This is the canvas image
                             "there are no filled gaps" );

                    }, 300 ); // We need to wait for the animation to end in order for the click event to be bound
                }, 10 );
            } )
            .on( "statechange", function( state ) {
                stateChangeCounter++;
                if ( stateChangeCounter === 1 ) {
                    assert.deepEqual( state.RESPONSE, { response: { list: { directedPair: [ [ "gapimg_1", "associablehotspot_6" ] ] } } }, "The pair is selected" );
                } else if ( stateChangeCounter === 2 ) {
                    assert.deepEqual( state.RESPONSE, { response: { list: { directedPair: [] } } }, "Response is empty" );
                    ready();
                }
            } )
            .assets( strategies )
            .init()
            .render( $container );
    } );

    QUnit.test( "set the default response", function( assert ) {
        var ready = assert.async();
        assert.expect( 2 );

        var $container = $( "#" + fixtureContainerId );

        assert.equal( $container.length, 1, "the item container exists" );

        runner = qtiItemRunner( "qti", gapMatchData )
            .on( "render", function() {
                var $gapFiller = $( '.qti-choice[data-identifier="gapimg_1"]', $container );
                var gapFillerImgSrc = $gapFiller.find( "img" ).attr( "src" );

                this.setState( { RESPONSE: { response: { list: { directedPair: [ [ "gapimg_1", "associablehotspot_6" ] ] } } } } );

                _.delay( function() {
                    var $gapFillerOnHotspot = $container.find( ".main-image-box image", $container ).eq( 1 );
                    assert.equal( $gapFillerOnHotspot.attr( "href" ), gapFillerImgSrc, "state has been restored" );

                    ready();
                }, 300 );
            } )
            .assets( strategies )
            .init()
            .render( $container );
    } );

    QUnit.test( "destroys", function( assert ) {
        var ready = assert.async();
        assert.expect( 2 );

        var $container = $( "#" + fixtureContainerId );
        assert.equal( $container.length, 1, "the item container exists" );

        qtiItemRunner( "qti", gapMatchData )
            .on( "render", function() {
                var self = this;

                //Call destroy manually
                var interaction = this._item.getInteractions()[ 0 ];
                interaction.renderer.destroy( interaction );

                var $gapFiller = $( '.qti-choice[data-identifier="gapimg_1"]', $container );
                var $hotspot = $( ".main-image-box rect", $container ).eq( 5 );

                interactUtils.tapOn( $gapFiller, function() {
                    interactUtils.tapOn( $hotspot, function() {
                        assert.deepEqual(
                            self.getState(),
                            { "RESPONSE": { response: { list: { directedPair: [] } } } },
                            "Click does not trigger response once destroyed" );
                        ready();

                    }, 10 );
                }, 10 );

            } )
            .assets( strategies )
            .init()
            .render( $container );
    } );

    QUnit.test( "resets the response", function( assert ) {
        var ready = assert.async();
        assert.expect( 3 );

        var $container = $( "#" + fixtureContainerId );
        assert.equal( $container.length, 1, "the item container exists" );

        runner = qtiItemRunner( "qti", gapMatchData )
            .on( "render", function() {
                var self = this;

                var $gapFiller = $( '.qti-choice[data-identifier="gapimg_1"]', $container );
                var gapFillerImgSrc = $gapFiller.find( "img" ).attr( "src" );
                var $hotspot = $( ".main-image-box rect", $container ).eq( 5 );

                interactUtils.tapOn( $gapFiller, function() {

                    interactUtils.tapOn( $hotspot, function() {

                        var $gapFillerOnHotspot = $container.find( ".main-image-box image" ).eq( 1 );
                        assert.equal( $gapFillerOnHotspot.attr( "href" ), gapFillerImgSrc, "gap filler is on canvas" );

                        _.delay( function() {

                            // Reset response manually
                            var interaction = self._item.getInteractions()[ 0 ];
                            interaction.renderer.resetResponse( interaction );

                            _.delay( function() {
                                assert.equal(
                                    $container.find( ".main-image-box image" ).length,
                                    1, // This is the canvas image
                                    "there is no filled gap" );

                                ready();
                            }, 100 );
                        }, 100 );
                    }, 300 );
                }, 100 );
            } )
            .assets( strategies )
            .init()
            .render( $container );
    } );

    QUnit.module( "Visual Test" );

    QUnit.test( "Display and play", function( assert ) {
        var ready = assert.async();
        assert.expect( 1 );

        var $container = $( "#" + outsideContainerId );
        assert.equal( $container.length, 1, "the item container exists" );

        qtiItemRunner( "qti", gapMatchData )
            .on( "render", function() {
                ready();
            } )
            .on( "statechange", function( state ) {
                document.getElementById( "response-display" ).textContent = JSON.stringify( state );
            } )
            .assets( strategies )
            .init()
            .render( $container );
    } );
} );

