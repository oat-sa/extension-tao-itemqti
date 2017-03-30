/**
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; under version 2
 * of the License (non-upgradable).
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA;
 */
define([
    'jquery',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/static/states/Active',
    'taoQtiItem/qtiCreator/editor/popup/popup',
    'taoQtiItem/qtiCreator/editor/MathEditor',
    'taoQtiItem/qtiCreator/editor/mathInput/mathInput',
    'taoQtiItem/qtiCreator/helper/popup',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/static/math',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiCreator/widgets/static/helpers/inline',
    'ui/dynamicComponent',
    'lodash',
    'i18n',
    'mathJax',
    'ui/tooltip'
], function(
    $,
    stateFactory,
    Active,
    popupFactory,
    MathEditor,
    mathInputFactory,
    popup,
    formTpl,
    formElement,
    inlineHelper,
    dynamicComponent,
    _,
    __,
    mathJax
){
    'use strict';

    var MathActive;

    var _throttle = 300;

    var components = {},
        $componentContainer,
        currentMode;

    MathActive = stateFactory.extend(Active, function create(){
        var areaBroker = this.widget.areaBroker; // fixme: use a getter

        $componentContainer = areaBroker.getContainer();

        // Create Wysiwyg editor component
        components.wysiwyg = popupFactory()
            .init({
                popupTitle: 'Latex (WYSIWYG)',
                width: 480,
                height: 320,
                minWidth: 240,
                maxWidth: 960,
                minHeight: 160,
                maxHeight: 640
            });

        components.wysiwyg.on('render', function() {
            var $component = this.getElement(),
                $popupContent = $component.find('.qti-creator-popup-content'),
                mathInput = mathInputFactory().init();

            mathInput.render($popupContent);
        });

        _.invoke(components, 'render', $componentContainer);
        _.invoke(components, 'center');
        _.invoke(components, 'hide');

        this.initForm();

    }, function destroy(){
        this.widget.$form.empty();

        _.invoke(components, 'destroy');
    });

    MathActive.prototype.initForm = function initForm(){

        var _widget = this.widget,
            $form = _widget.$form,
            math = _widget.element,
            mathML = math.mathML || '',
            tex = math.getAnnotation('latex') || '',
            display = math.attr('display') || 'inline',
            editMode = 'latex',
            $editorBtn ;

        if(!tex.trim() && mathML.trim()){
            editMode = 'mathml';
        }

        $form.html(formTpl({
            mathjax : !!mathJax,
            editMode : editMode,
            latex : tex,
            mathml : mathML
        }));

        if(mathJax){

            //init select boxes
            $form.find('select[name=display]').val(display);
            $form.find('select[name=editMode]').val(editMode);

            $form.children('.panel[data-role="' + editMode + '"]').show();
            _toggleMode($form, editMode);

            //... init standard ui widget
            formElement.initWidget($form);

            this.initFormChangeListener();

            $editorBtn = $form.find('.open-editor');
            $editorBtn.on('click', function() { //todo: remove listener
                if (components[currentMode]) {
                    components[currentMode].show();
                }
            });

        }



    };

    MathActive.prototype.initFormChangeListener = function initFormChangeListener(){

        var _widget = this.widget,
            $container = _widget.$container,
            $form = _widget.$form,
            math = _widget.element,
            mathML = math.mathML,
            mathEditor,
            tex = math.getAnnotation('latex'),
            display = math.attr('display') || 'inline',
            $fields = {
                mathml : $form.find('textarea[name=mathml]'),
                latex : $form.find('input[name=latex]')
            },
            $modeSelector = $form.find('select[name=editMode]');


        $form.find('.sidebar-popup-trigger').each(function() {
            var $trigger = $(this),
                context = $trigger.data('context');

            // basic popup functionality
            popup.init($trigger);

            // after popup opens
            $trigger.on('open.popup', function(e, params) {
                var $largeField = params.popup.find(':input[data-for="' + context + '"]');

                // copy value
                $largeField.val($fields[context].val());

                $largeField.on('keyup', function(){
                    $fields[context].val($(this).val());
                    $fields[context].trigger('keyup');
                });
                $largeField.attr('placeholder', $fields[context].attr('placeholder'));

                // disable form
                $fields[context].prop('disabled', true);
                $modeSelector.prop('disabled', true);

            });

            // after popup closes
            $trigger.on('close.popup', function(e, params) {
                var $largeField = params.popup.find(':input[data-for="' + context + '"]');

                $fields[context].val($largeField.val());
                $fields[context].prop('disabled', false);
                $modeSelector.prop('disabled', false);

            });
        });


        mathEditor = new MathEditor({
            tex : tex,
            mathML : mathML,
            display : display,
            buffer : $form.find('.math-buffer'),
            target : _widget.$original
        });

        //init data change callbacks
        formElement.setChangeCallbacks($form, math, {
            display : function(m, value){
                if(value === 'block'){
                    m.attr('display', 'block');
                }else{
                    m.removeAttr('display');
                }
                _widget.rebuild({
                    ready : function(widget){
                        widget.changeState('active');
                    }
                });
            },
            editMode : function(m, value){

                _toggleMode($form, value);
            },
            latex : _.throttle(function(m, value){

                mathEditor.setTex(value).renderFromTex(function(){

                    //saveTex
                    m.setAnnotation('latex', value);

                    //update mathML
                    $fields.mathml.html(mathEditor.mathML);
                    m.setMathML(mathEditor.mathML);

                    inlineHelper.togglePlaceholder(_widget);

                    $container.change();
                });

            }, _throttle),
            mathml : _.throttle(function(m, value){

                mathEditor.setMathML(value).renderFromMathML(function(){

                    //save mathML
                    m.setMathML(mathEditor.mathML);

                    //clear tex:
                    $fields.latex.val('');
                    m.removeAnnotation('latex');

                    inlineHelper.togglePlaceholder(_widget);

                    $container.change();
                });

            }, _throttle)
        });
    };

    function _toggleMode($form, mode){

        var $panels = {
                mathml : $form.children('.panel[data-role="mathml"]'),
                latex : $form.children('.panel[data-role="latex"]')
            },
            $fields = {
                mathml : $form.find('textarea[name=mathml]'),
                latex : $form.find('input[name=latex]')
            },
            $editMode = $form.find('select[name=editMode]');

        currentMode = mode;

        //toggle form visibility
        $panels.mathml.hide();
        $panels.latex.hide();
        components.wysiwyg.hide();

        switch (mode) {
            case 'latex': {
                $panels.latex.show();
                break;
            }
            case 'mathml': {
                $panels.mathml.show();
                if($fields.latex.val()){
                    //show a warning here, stating that the content in LaTeX will be removed
                    if(!$fields.mathml.data('qtip')){
                        _createWarningTooltip($fields.mathml);
                    }
                    $fields.mathml.qtip('show');
                    $editMode.off('change.editMode').one('change.editMode', function(){
                        $fields.mathml.qtip('hide');
                    });
                }
                break;
            }
            case 'wysiwyg': {
                components.wysiwyg.show();
                break;
            }
        }
    }


    function _createWarningTooltip($mathField){

        var $content = $('<span>')
            .html(__('Currently conversion from MathML to LaTeX is not available. Editing MathML here will have the LaTex code discarded.'));

        $mathField.qtip({
            theme : 'error',
            show: {
                event : 'custom'
            },
            hide: {
                event : 'custom'
            },
            content: {
                text: $content
            }
        });

        $mathField.on('focus.mathwarning', function(){
            $mathField.qtip('hide');
        });

        setTimeout(function(){
            $mathField.qtip('hide');
        }, 3000);
    }

    return MathActive;
});
