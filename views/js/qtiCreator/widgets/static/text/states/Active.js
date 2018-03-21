define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/static/states/Active',
    'taoQtiItem/qtiCreator/editor/ckEditor/htmlEditor',
    'taoQtiItem/qtiCreator/editor/gridEditor/content',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/static/text'
], function(stateFactory, Active, htmlEditor, content, formElement, formTpl){
    'use strict';

    var wrapperCls = 'custom-text-box';

    var TextActive = stateFactory.extend(Active, function(){

        this.buildEditor();
        this.initForm();

    }, function(){

        this.destroyEditor();
        this.widget.$form.empty();
    });

    TextActive.prototype.buildEditor = function(){

        var widget = this.widget;
        var $editableContainer = widget.$container;
        var container = widget.element;
        var changeCallback = content.getChangeCallback(container);

        $editableContainer.attr('data-html-editable-container', true);

        if(!htmlEditor.hasEditor($editableContainer)){

            htmlEditor.buildEditor($editableContainer, {
                change : function(data) {
                    changeCallback.call(this, data);

                    // remove the form value if there is no content to apply on
                    if (!data) {
                        widget.$form.find('[name="textBlockCssClass"]').val('');
                    }
                },
                blur : function(){
                    widget.changeState('sleep');
                },
                data : {
                    widget : widget,
                    container : container
                }
            });
        }
    };

    TextActive.prototype.destroyEditor = function(){
        //search and destroy the editor
        htmlEditor.destroyEditor(this.widget.$container);
    };

    TextActive.prototype.initForm = function(){
        var widget = this.widget;
        var $form = widget.$form;
        var blockCls = widget.$container.find('.' + wrapperCls).attr('class');

        $form.html(formTpl({
            textBlockCssClass: (blockCls || '').replace(wrapperCls, '').trim()
        }));

        formElement.initWidget($form);

        formElement.setChangeCallbacks($form, widget.element, {
            textBlockCssClass: function(element, value) {
                var $block = widget.$container.find('.' + wrapperCls);

                // prevent to have the wrapper class twice
                value = value.trim();
                if (value === wrapperCls) {
                    value = '';
                }

                if (!value) {
                    // no need to have a wrapper if no block class is set
                    $block.children().unwrap();
                } else {
                    if (!$block.length) {
                        // no wrapper found, insert one
                        $block = widget.$container
                            .find('[data-html-editable="true"]')
                            .wrapInner('<div />')
                            .children();
                    }

                    // replace the block class
                    $block.attr('class', wrapperCls + ' ' + value);
                }
            }
        });
    };

    return TextActive;
});
