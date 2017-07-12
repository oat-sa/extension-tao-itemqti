define([
    'jquery',
    'lodash',
    'ckeditor',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/choices/states/Choice',
    'taoQtiItem/qtiCreator/widgets/choices/simpleAssociableChoice/states/Choice',
    'taoQtiItem/qtiItem/core/Element',
    'taoQtiItem/qtiCreator/editor/ckEditor/htmlEditor',
    'taoQtiItem/qtiCreator/editor/gridEditor/content'
], function($, _, CKEditor, stateFactory, Choice, SimpleAssociableChoice, Element, htmlEditor, contentHelper){
    'use strict';

    var GapTextStateChoice = stateFactory.extend(Choice, function(){

        var _widget = this.widget;

        //listener to other siblings choice mode
        _widget.beforeStateInit(function(e, element, state){

            if(Element.isA(element, 'choice') && _widget.interaction.getBody().getElement(element.serial)){//@todo hottext an

                if(state.name === 'choice' && element.serial !== _widget.serial){
                    _widget.changeState('question');
                }

            }

        }, 'otherActive');

        this.buildEditor();

    }, function(){

        this.destroyEditor();

        this.widget.offEvents('otherActive');
    });

    GapTextStateChoice.prototype.initForm = function(){
        SimpleAssociableChoice.prototype.initForm.call(this);
    };

    GapTextStateChoice.prototype.buildEditor = function(){

        var _widget = this.widget,
            container = _widget.element.getBody(),
            $editableContainer = _widget.$container;

        //@todo set them in the tpl
        $editableContainer.attr('data-html-editable-container', true);

        if(!htmlEditor.hasEditor($editableContainer)){

            htmlEditor.buildEditor($editableContainer, {
                change : contentHelper.getChangeCallback(container),
                data : {
                    container : container,
                    widget : _widget
                },
                hideTriggerOnBlur: true,
                toolbar: [{
                    name : 'basicstyles',
                    items : ['Bold', 'Italic', 'Subscript', 'Superscript']
                }, {
                    name : 'insert',
                    items : ['SpecialChar']
                }],
                qtiMedia: false,
                qtiInclude: false,
                enterMode : CKEditor.ENTER_BR
            });
        }

        $editableContainer.on('keypress.qti-widget', function(e){
            if(e.which === 13){
                e.preventDefault();
                $(this).blur();
            }

        });
    };

    GapTextStateChoice.prototype.destroyEditor = function(){
        var _widget = this.widget,
            interaction = _widget.interaction,
            $editableContainer = _widget.$container,
            $editable = $editableContainer.find('[data-html-editable]'),
            placeholder;

        /**
         * Workaround for ckEditor. When adding text to an empty choice, when initialising the widget on an empty content,
         * ck automatically wraps it in a <p>, which breaks QTI compatibility.
         * Therefore, we replace an empty choice with a placeholder text.
         */
        if (! htmlEditor.getData($editable) || htmlEditor.getData($editable) === '') {
            placeholder = interaction.getNextPlaceholder();
            htmlEditor.setData($editable, placeholder);
        }

        $editableContainer.off('.qti-widget');

        //search and destroy the editor
        htmlEditor.destroyEditor(this.widget.$container);
    };

    return GapTextStateChoice;
});
