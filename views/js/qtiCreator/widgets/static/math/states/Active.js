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

    MathActive = stateFactory.extend(Active, function create(){
        this.initForm();

    }, function destroy(){
        this.$fields = null;
        this.$panels = null;
        this.popups.latex.destroy();
        this.popups.mathml.destroy();
        this.widget.$form.empty();
    });

    MathActive.prototype.initForm = function initForm(){
        var _widget = this.widget,
            $form = _widget.$form,
            math = _widget.element,
            mathML = math.mathML || '',
            tex = math.getAnnotation('latex') || '',
            display = math.attr('display') || 'inline',
            editMode = 'latex',
            $popupsContainer,
            areaBroker = this.widget.areaBroker; // fixme: use a getter

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
            // grab a reference to dom elements
            this.$fields = {
                mathml : $form.find('textarea[name=mathml]'),
                latex : $form.find('input[name=latex]')
            };
            this.$panels = {
                mathml : $form.children('.panel[data-role="mathml"]'),
                latex : $form.children('.panel[data-role="latex"]')
            };
            this.$editMode = $form.find('select[name=editMode]');

            //init select boxes
            this.$editMode.val(editMode);
            $form.find('select[name=display]').val(display);

            this._toggleMode(editMode);

            // Create popups
            $popupsContainer = areaBroker.getContainer();
            this.popups = {
                latex: this.createLatexPopup($popupsContainer)
            };

            //... init standard ui widget
            formElement.initWidget($form);

            this.initFormChangeListener();
        }
    };

    MathActive.prototype.initFormChangeListener = function initFormChangeListener(){

        var self = this,
            _widget = this.widget,
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

                self._toggleMode(value);
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

        $form.find('.latex-editor').on('click', function() { //todo: remove listener
            if (self.popups.latex) {
                self.popups.latex.show();
            }
        });
        $form.find('.mathml-editor').on('click', function() { //todo: remove listener
            if (self.popups.mathml) {
                self.popups.mathml.show();
            }
        });
    };


    MathActive.prototype.createLatexPopup = function createLatexPopup($container) {
        var self = this;

        return popupFactory()
            .on('render', function() {
                var $component = this.getElement(),
                    $popupContent = $component.find('.qti-creator-popup-content');

                this.mathInput = mathInputFactory()
                    .init()
                    .render($popupContent)
                    .on('change', function(latex) {
                        self.$fields.latex.val(latex);
                        self.$fields.latex.trigger('keyup');
                    });
            })
            .on('show', function() {
                // todo: implement this
                // $largeField.attr('placeholder', $fields[context].attr('placeholder'));

                this.mathInput.setLatex(self.$fields.latex.val());
                // disable form
                self.$fields.latex.prop('disabled', true);
                self.$editMode.prop('disabled', true);
            })
            .on('hide', function() {
                // enable form
                self.$fields.latex.prop('disabled', false);
                self.$editMode.prop('disabled', false);
            })
            .init({
                popupTitle: 'Latex (WYSIWYG)',
                width: 480,
                height: 320,
                minWidth: 240,
                maxWidth: 960,
                minHeight: 160,
                maxHeight: 640
            })
            .render($container)
            .center()
            .hide();

    };

    MathActive.prototype.createMathmlPopup = function createMathmlPopup() {
        var self = this;

        return popupFactory()
            .on('render', function() {
                var $component = this.getElement(),
                    $popupContent = $component.find('.qti-creator-popup-content'), // todo: use getContent()
                    mathInput = mathInputFactory().init();

                mathInput
                    .render($popupContent)
                    .on('change', function(mathml) {
                        self.$fields.mathml.val(mathml);
                        self.$fields.mathml.trigger('keyup');
                    });
            })
            .init({
                popupTitle: 'Latex (WYSIWYG)',
                width: 480,
                height: 320,
                minWidth: 240,
                maxWidth: 960,
                minHeight: 160,
                maxHeight: 640
            });
    };


    MathActive.prototype._toggleMode = function _toggleMode(mode){
        var self = this;

        switch (mode) {
            case 'latex': {
                this.$panels.latex.show();
                this.$panels.mathml.hide();
                break;
            }
            case 'mathml': {
                this.$panels.latex.hide();
                this.$panels.mathml.show();
                if(this.$fields.latex.val()){
                    //show a warning here, stating that the content in LaTeX will be removed
                    if(!this.$fields.mathml.data('qtip')){
                        _createWarningTooltip(this.$fields.mathml);
                    }
                    this.$fields.mathml.qtip('show');
                    this.$editMode.off('change.editMode').one('change.editMode', function(){
                        self.$fields.mathml.qtip('hide');
                    });
                }
                break;
            }
        }
    };

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
