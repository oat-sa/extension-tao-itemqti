define([
    'jquery',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/choices/states/Question',
    'taoQtiItem/qtiCreator/widgets/choices/helpers/formElement',
    'lodash'
], function($, stateFactory, QuestionState, formElement, _){
    'use strict';
    const ChoiceStateQuestion = stateFactory.extend(QuestionState, function initStateQuestion(){
        this.buildEditor();
    }, function exitStateQuestion(){
        this.destroyEditor();
    });

    ChoiceStateQuestion.prototype.createToolbar = function(){

        const _widget = this.widget,
            $toolbar = _widget.$container.find('td:last');

        //set toolbar button behaviour:
        formElement.initShufflePinToggle(_widget);
        formElement.initDelete(_widget);

        return $toolbar;
    };

    ChoiceStateQuestion.prototype.buildEditor = function(){

        const _widget = this.widget;

        _widget.$container.find('.editable-content')
            .attr('contentEditable', true)
            .on('keyup.qti-widget', _.throttle(function(){

                //update model
                _widget.element.val(_.escape($(this).text()));

                //update placeholder
                _widget.$original.width($(this).width());

            }, 200)).on('focus.qti-widget', function(){

                _widget.changeState('choice');

            }).on('keypress.qti-widget', function(e){

                if(e.which === 13){
                    e.preventDefault();
                    $(this).blur();
                    _widget.changeState('question');
                }

            }).on('input.qti-widget', function(){
                // clean format of paste text
                $(this).html($(this).text());
            });
    };

    ChoiceStateQuestion.prototype.destroyEditor = function(){

        this.widget.$container.find('.editable-content')
            .removeAttr('contentEditable')
            .off('keyup.qti-widget');
    };

    return ChoiceStateQuestion;
});
