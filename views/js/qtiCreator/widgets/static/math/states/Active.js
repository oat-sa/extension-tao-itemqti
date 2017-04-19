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
    'taoQtiItem/qtiCreator/helper/windowPopup',
    'taoQtiItem/qtiCreator/editor/MathEditor',
    'taoQtiItem/qtiCreator/editor/mathInput/mathInput',
    'taoQtiItem/qtiCreator/helper/popup',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/static/math',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/static/mathPopup',
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
    windowPopupFactory,
    MathEditor,
    mathInputFactory,
    popup,
    formTpl,
    popupFormTpl,
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
        // todo: more?
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
                latexWysiwyg: this.createLatexWysiwygPopup($popupsContainer),
                latex: this.createLargeEditor($popupsContainer, 'latex'),
                mathml: this.createLargeEditor($popupsContainer, 'mathml')
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
            display = math.attr('display') || 'inline';

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
                    self.$fields.mathml.val(mathEditor.mathML);
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
                    self.$fields.latex.val('');
                    m.removeAnnotation('latex');

                    inlineHelper.togglePlaceholder(_widget);

                    $container.change();
                });

            }, _throttle)
        });

        // popup buttons behavior
        $form.find('.popup-btn').on('click', function(e) {
            var $target = $(e.target),
                targetPopup = $target.data('control');

            if (self.popups[targetPopup]) {
                self.popups[targetPopup].show();
            }
        });
    };

    MathActive.prototype.createLatexWysiwygPopup = function createLatexWysiwygPopup($container) {
        var self = this,
            popupOptions = {
                // resizable: false,
                windowTitle: 'LaTeX (WYSIWYG)',
                width: 640,
                height: 280,
                minWidth: 460,
                maxWidth: 960,
                minHeight: 220,
                maxHeight: 640
            };

        return windowPopupFactory({}, popupOptions)
            .on('render', function() {
                var $popupContent = this.getBody();

                this.mathInput = mathInputFactory()
                    .init()
                    .render($popupContent)
                    .on('change', function(latex) {
                        self.$fields.latex.val(latex);
                        self.$fields.latex.trigger('keyup');
                    });
            })
            .on('show', function() {
                this.mathInput.setLatex(self.$fields.latex.val());
                self._disableForm();
            })
            .on('hide', function() {
                self._enableForm();
            })
            .init()
            .render($container)
            .center()
            .hide();
    };

    MathActive.prototype.createLargeEditor = function createLargeEditor($container, popupMode) {
        var self = this,
            popupOptions = {
                windowTitle: (popupMode === 'latex') ? 'LaTeX' : 'MathML',
                width: 640,
                height: 320,
                minWidth: 240,
                maxWidth: 960,
                minHeight: 160,
                maxHeight: 640
            };

        return windowPopupFactory({}, popupOptions)
            .on('render', function() {
                var $popupContent = this.getBody();

                this.$popupField = $(popupFormTpl({
                    popupMode: popupMode,
                    placeholder: self.$fields[popupMode].attr('placeholder')
                }));

                $popupContent.append(this.$popupField);

                this.$popupField
                    .on('mousedown', function(e) {
                        e.stopPropagation();
                    })
                    .on('keyup', function(e) {
                        self.$fields[popupMode].val($(e.target).val());
                        self.$fields[popupMode].trigger('keyup');
                    });
            })
            .on('show', function() {
                this.$popupField.val((self.$fields[popupMode].val()));
                self._disableForm();
            })
            .on('hide', function() {
                self._enableForm();
            })
            .init()
            .render($container)
            .center()
            .hide();
    };

    MathActive.prototype._enableForm = function _enableForm(){
        this.widget.$form.find('button,input,select,textarea').prop('disabled', false);
    };

    MathActive.prototype._disableForm = function _disableForm(){
        this.widget.$form.find('button,input,select,textarea').prop('disabled', true);
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
