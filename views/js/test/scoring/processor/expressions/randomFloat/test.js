define( [

    "lodash",
    "taoQtiItem/scoring/processor/expressions/preprocessor",
    "taoQtiItem/scoring/processor/expressions/randomFloat",
    "taoQtiItem/scoring/processor/errorHandler"
], function(  _, preProcessorFactory, randomFloatProcessor, errorHandler ) {

    QUnit.module( "API" );

    QUnit.test( "structure", function( assert ) {
        assert.ok( _.isPlainObject( randomFloatProcessor ), "the processor expose an object" );
        assert.ok( _.isFunction( randomFloatProcessor.process ), "the processor has a process function" );
    } );

    QUnit.module( "Process" );

    QUnit.test( "The processor returns a single integer", function( assert ) {
        assert.expect( 4 );

        randomFloatProcessor.expression = {
            attributes: { min: 2, max: 2 }
        };
        randomFloatProcessor.preProcessor = preProcessorFactory( {} );
        var result = randomFloatProcessor.process();

        assert.ok( _.isPlainObject( result ), "The processor result is a plain object" );
        assert.equal( result.cardinality, "single", "The processor result has a single cardinality" );
        assert.equal( result.baseType, "float", "The processor result has a float baseType" );
        assert.ok( _.isNumber( result.value ), "The processor result has a numeric value" );
    } );

    QUnit.test( "Fails if there aren't any attributes", function( assert ) {
        var ready = assert.async();
        assert.expect( 1 );
        randomFloatProcessor.expression = {
            attributes: {  }
        };
        errorHandler.listen( "scoring", function( err ) {
            assert.equal( err.name, "Error", "Without the attributes the processor throws and error" );
            ready();
        } );

        randomFloatProcessor.process();
    } );

    QUnit.test( "Fails if max is not valid", function( assert ) {
        var ready = assert.async();
        assert.expect( 1 );
        randomFloatProcessor.expression = {
            attributes: { max: "foo" }
        };
        errorHandler.listen( "scoring", function( err ) {
            assert.equal( err.name, "Error", "The max attribute must have a value" );
            ready();
        } );

        randomFloatProcessor.process();
    } );

    QUnit.test( "Fails if min is greater than max", function( assert ) {
        var ready = assert.async();
        assert.expect( 1 );
        randomFloatProcessor.expression = {
            attributes: { min: 10, max: 5 }
        };
        errorHandler.listen( "scoring", function( err ) {
            assert.equal( err.name, "Error", "The max attribute must be greater than the min" );
            ready();
        } );

        randomFloatProcessor.process();
    } );

    var dataProvider = [ {
        title: "0.25 to 0.50",
        min: 0.25,
        max: 0.50
    }, {
        title: "0.15 to 0.16",
        min: 0.15,
        max: 0.16
    }, {
        title: "5 to 6",
        min: 5,
        max: 6
    }, {
        title: "5 to 6 with strings",
        min: "5",
        max: "6"
    } ];

    QUnit
      .cases.init( dataProvider )
      .test( "randomFloat ", function( data, assert ) {
        randomFloatProcessor.expression = {
            attributes: {
                min: data.min,
                max: data.max
            }
        };
        randomFloatProcessor.preProcessor = preProcessorFactory( {} );
        var result = randomFloatProcessor.process();

        assert.ok( result.value >= data.min, "The value " + result.value + " is GTE " + data.min );
        assert.ok( result.value <= data.max, "The value " + result.value + " is LTE " + data.max );
    } );

} );
