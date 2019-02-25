define([
    'jquery',
    'lodash',
    'i18n',
    'taoQtiItem/runner/qtiItemRunner',
    'json!taoQtiItem/test/samples/json/text-entry-noconstraint.json',
    'json!taoQtiItem/test/samples/json/text-entry-length.json',
    'json!taoQtiItem/test/samples/json/text-entry-pattern.json'
], function ($, _, __, qtiItemRunner, textEntryData, textEntryLengthConstrainedData, textEntryPatternConstrainedData) {
    'use strict';

    var runner;

    function getTooltipContent($input){
        var content = getTooltip($input);
        if(content){
            return content.find('.tooltip-body').html();
        }
    }

    function getTooltip($input){
        var instance = $input.data('$tooltip');
        if(instance && instance.popperInstance.popper){
            return $(instance.popperInstance.popper);
        }
    }

    QUnit.module('Text Entry Interaction', {
        teardown: function () {
            if (runner) {
                runner.clear();
            }
        }
    });

    QUnit.asyncTest('Length constraint', function (assert) {

        var $container = $('#fixture-length-constraint');

        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        runner = qtiItemRunner('qti', textEntryLengthConstrainedData)
            .on('render', function () {
                var $input = $container.find('.qti-interaction.qti-textEntryInteraction');

                assert.equal($input.length, 1, 'the container contains a text entry interaction .qti-textEntryInteraction');

                $input.val('');
                $input.focus();
                assert.equal(getTooltipContent($input), __('%d characters allowed', 5), 'the instruction message is correct');
                assert.ok(getTooltip($input).is(':visible'), 'info tooltip is visible');

                $input.val('123');
                $input.keyup();
                assert.equal(getTooltipContent($input), __('%d/%d', 3, 5), 'the instruction message is correct');
                assert.ok(getTooltip($input).is(':visible'), 'info tooltip is visible');

                $input.val('12345');
                $input.keyup();
                assert.equal(getTooltipContent($input), __('%d/%d', 5, 5), 'the warning message is correct');
                assert.ok(getTooltip($input).is(':visible'), 'warning tooltip is visible');
                assert.ok($input.hasClass('maxed'), 'has state maxed');

                $input.val('1234');
                $input.keyup();
                assert.equal(getTooltipContent($input), __('%d/%d', 4, 5), 'the instruction message is correct');
                assert.ok(getTooltip($input).is(':visible'), 'info tooltip is visible');
                assert.ok(!$input.hasClass('maxed'), 'has state maxed removed');

                QUnit.start();
            })
            .init()
            .render($container);
    });

    QUnit.asyncTest('Pattern constraint - incorrect', function (assert) {

        var $container = $('#pattern-constraint-incorrect');

        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        runner = qtiItemRunner('qti', textEntryPatternConstrainedData)
            .on('render', function () {
                var $input = $container.find('.qti-interaction.qti-textEntryInteraction');

                assert.equal($input.length, 1, 'the container contains a text entry interaction .qti-textEntryInteraction');

                $input.val('');
                $input.focus();
                assert.equal(getTooltipContent($input), __('This is not a valid answer'));

                $input.val('123');
                $input.keyup();

                QUnit.start();
            }).on('responsechange', function(){
                var $input = $container.find('.qti-interaction.qti-textEntryInteraction');
                assert.equal(getTooltipContent($input), __('This is not a valid answer'), 'the error message is correct');
                assert.ok(getTooltip($input).is(':visible'), 'the error tooltip is visible after an invalid response');
            })
            .init()
            .render($container);
    });

    QUnit.asyncTest('Pattern constraint - correct', function (assert) {

        var $container = $('#pattern-constraint-correct');

        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        runner = qtiItemRunner('qti', textEntryPatternConstrainedData)
            .on('render', function () {
                var $input = $container.find('.qti-interaction.qti-textEntryInteraction');

                assert.equal($input.length, 1, 'the container contains a text entry interaction .qti-textEntryInteraction');

                $input.val('');
                $input.focus();
                assert.equal(getTooltipContent($input), __('This is not a valid answer'));

                $input.val('PARIS');
                $input.keyup();

                QUnit.start();
            }).on('responsechange', function(){
                var $input = $container.find('.qti-interaction.qti-textEntryInteraction');
                assert.equal(getTooltip($input), undefined, 'the error tooltip is hidden after a correct response');
            })
            .init()
            .render($container);
    });

    QUnit.asyncTest('set/get response', function(assert){

        var $container = $('#set-get-response');
        var state = {"RESPONSE":{response:{"base":{"string":"PARIS"}}}};

        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        runner = qtiItemRunner('qti', textEntryData)
            .on('render', function(){
                var $input = $container.find('.qti-interaction.qti-textEntryInteraction');

                assert.equal($input.length, 1, 'the container contains a text entry interaction .qti-textEntryInteraction');
                assert.equal($input.val(), '', 'the text input is initially empty');

                this.setState(state);

                assert.equal($input.val(), 'PARIS', 'the text input has been correctly set');
                assert.deepEqual(this.getState(state), state, 'state is correct');

                $input.keyup();//trigger the response changed event

                QUnit.start();
            }).on('statechange', function(retrievedState){
                assert.deepEqual(retrievedState, state, 'statechange state is correct');
            })
            .init()
            .render($container);
    });

    module('Visual Test');

    QUnit.asyncTest('Display and play', function (assert) {
        var $container = $('#outside-container');

        QUnit.expect(3);

        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        qtiItemRunner('qti', textEntryLengthConstrainedData)
            .on('render', function () {
                assert.equal($container.find('.qti-interaction.qti-textEntryInteraction').length, 1, 'the container contains a text entry interaction .qti-textEntryInteraction');

                QUnit.start();
            })
            .init()
            .render($container);
    });
});

