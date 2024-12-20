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
    formTpl,
    popupFormTpl,
    formElement,
    inlineHelper,
    dynamicComponent,
    _,
    __,
    mathJax,
    tooltip
){
    'use strict';

    var MathActive;

    var _throttle = 300;

    MathActive = stateFactory.extend(
        Active,
        function create(){
            this.initForm();

        },
        function destroy(){
            _.invokeMap(this.popups, 'destroy');
            this.popups = null;
            if (this.fields && this.fields.$mathml) {
                this.fields.$mathml.data('$tooltip').dispose();
                this.fields.$mathml.removeData('$tooltip');
            }
            this.fields = null;
            this.widget.$form.empty();
        }
    );

    MathActive.prototype.initForm = function initForm(){
        var _widget = this.widget,
            $form = _widget.$form,
            math = _widget.element,
            mathML = math.mathML || '',
            tex = math.getAnnotation('latex') || '',
            display = math.attr('display') || 'inline',
            editMode = 'latex',
            $popupsContainer,
            areaBroker = this.widget.getAreaBroker();

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
            // grab a reference to the DOM elements containing the source of truth for latex/mathml codes
            this.fields = {
                $mathml : $form.find('textarea[name=mathml]'),
                $latex : $form.find('input[name=latex]')
            };
            _attachMathmlWarning(this.fields.$mathml);

            //init select boxes
            $form.find('select[name=editMode]').val(editMode);
            $form.find('select[name=display]').val(display);

            this._toggleMode(editMode);

            // Create and render popups
            $popupsContainer = areaBroker.getContainer();
            this.popups = {
                latexWysiwyg: this.createLatexWysiwygPopup(),
                latex: this.createLargeEditorPopup('latex'),
                mathml: this.createLargeEditorPopup('mathml')
            };

            _.forOwn(this.popups, function(popup) {
                popup
                    .init()
                    .render($popupsContainer)
                    .center()
                    .hide();
            });

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
                    if (self.fields) {
                        self.fields.$mathml.val(mathEditor.mathML);
                    }
                    m.setMathML(mathEditor.mathML);

                    inlineHelper.togglePlaceholder(_widget);

                    $container.change();
                });

            }, _throttle),
            mathml : _.throttle(function(m, value){
                // this callback is bound on the keyup event, which alone is not enough to decide if the content has
                // really changed or not, as the user might have only pressed arrow keys.
                // Thus, we do an extra check here to avoid deleting the latex content for nothing
                var hasChanged = value !== mathEditor.mathML;

                mathEditor.setMathML(value).renderFromMathML(function(){

                    //save mathML
                    m.setMathML(mathEditor.mathML);

                    //clear tex if mathml has changed
                    if (hasChanged) {
                        if (self.fields) {
                            self.fields.$latex.val('');
                        }
                        m.removeAnnotation('latex');
                    }

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

    MathActive.prototype.createLatexWysiwygPopup = function createLatexWysiwygPopup() {
        var self = this,
            popupOptions = {
                windowTitle: 'LaTeX (WYSIWYG)',
                width: 655,
                height: 280,
                minWidth: 460,
                maxWidth: 960,
                minHeight: 220,
                maxHeight: 640,
                resizableEdges: { top: false, right: true, bottom: true, left: true }
            };

        return windowPopupFactory({}, popupOptions)
            .on('render', function() {
                var $popupContent = this.getBody();

                this.mathInput = mathInputFactory()
                    .init()
                    .render($popupContent)
                    .on('change', function(latex) {
                        self.fields.$latex.val(latex);
                        self.fields.$latex.trigger('keyup');
                    });
            })
            .on('show', function() {
                var currentLatex = self.fields.$latex.val(),
                    mathInput = this.mathInput;

                // defering fixes a bug in the scaling of some MQ characters (\sqrt)
                _.defer(function() {
                    mathInput.setLatex(currentLatex);
                });
                self._disableForm();
            })
            .on('hide', function() {
                self._enableForm();
            });
    };

    MathActive.prototype.createLargeEditorPopup = function createLargeEditorPopup(popupMode) {
        var self = this,
            popupOptions = {
                windowTitle: (popupMode === 'latex') ? 'LaTeX' : 'MathML',
                width: 640,
                height: 320,
                minWidth: 240,
                maxWidth: 960,
                minHeight: 160,
                maxHeight: 640,
                resizableEdges: { top: false, right: true, bottom: true, left: true }
            },
            smallField = self.fields['$' + popupMode]; // the corresponding "small" field in the widget form

        return windowPopupFactory({}, popupOptions)
            .on('render', function() {
                var $popupContent = this.getBody();

                this.$popupField = $(popupFormTpl({
                    popupMode: popupMode,
                    placeholder: smallField.attr('placeholder')
                }));

                $popupContent.append(this.$popupField);

                this.$popupField
                    .on('mousedown', function(e) {
                        e.stopPropagation();
                    })
                    .on('keyup', function(e) {
                        smallField.val($(e.target).val());
                        smallField.trigger('keyup');
                    });
            })
            .on('show', function() {
                this.$popupField.val((smallField.val()));
                if (popupMode === 'mathml') {
                    self.fields.$mathml.data('$tooltip').hide();
                }
                self._disableForm();
            })
            .on('hide', function() {
                self._enableForm();
            });
    };

    MathActive.prototype._enableForm = function _enableForm(){
        this.widget.$form.find('button,input,select,textarea').prop('disabled', false);
    };

    MathActive.prototype._disableForm = function _disableForm(){
        this.widget.$form.find('button,input,select,textarea').prop('disabled', true);
    };

    MathActive.prototype._toggleMode = function _toggleMode(mode){
        var self = this,
            _widget = this.widget,
            $form = _widget.$form,
            panels = {
                $mathml : $form.children('.panel[data-role="mathml"]'),
                $latex : $form.children('.panel[data-role="latex"]')
            };

        switch (mode) {
            case 'latex': {
                panels.$latex.show();
                panels.$mathml.hide();
                this.fields.$mathml.data('$tooltip').hide();

                break;
            }
            case 'mathml': {
                panels.$latex.hide();
                panels.$mathml.show();
                if(this.fields.$latex.val()){
                    this.fields.$mathml.data('$tooltip').show();

                    this.fields.$mathml.on('keyup.mathWarning', function() {
                        self.fields.$mathml.data('$tooltip').hide();
                        self.fields.$mathml.off('.mathWarning');
                    });
                }
                break;
            }
        }
    };

    function _attachMathmlWarning($mathField){
        var widgetTooltip;
        var tooltipContent = __('Currently conversion from MathML to LaTeX is not available. Editing MathML here will have the LaTex code discarded.');

        if(!$mathField.data('$tooltip')){
            widgetTooltip = tooltip.error($mathField, tooltipContent, {
                trigger: 'manual',
            });
            $mathField.data('$tooltip', widgetTooltip);
        }
    }

    return MathActive;
});
