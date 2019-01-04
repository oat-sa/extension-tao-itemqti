/*
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
 * Copyright (c) 2015 (original work) Open Assessment Technologies SA;
 *
 */

/**
 * Form elements helper
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'taoQtiItem/qtiItem/core/Element',
    'util/dom',
    'ui/incrementer',
    'ui/tooltip',
    'ui/selecter',
    'ui/inplacer',
    'ui/groupvalidator',
    'taoQtiItem/qtiCreator/widgets/helpers/validators'
], function($, _, __, Element, dom, spinner, tooltip, select2) {
    'use strict';

    /**
     * Update response declaration
     * @param {Object} interaction
     * @param {Number} maxChoice
     * @param {Boolean} [updateCardinality = true]
     * @throws {Error} if the element is not an interaction
     */
    var updateResponseDeclaration = function updateResponseDeclaration(interaction, maxChoice, updateCardinality) {
        var responseDeclaration;
        var correct = [];

        if (! Element.isA(interaction, 'interaction') ) {
            throw new Error('Tthe first argument must be an interaction, the current element is ' + interaction.qtiClass);
        }

        updateCardinality = (typeof updateCardinality === 'undefined') ? true : !!updateCardinality;
        responseDeclaration = interaction.getResponseDeclaration();
        if (updateCardinality) {
            responseDeclaration.attr('cardinality', (maxChoice === 1) ? 'single' : 'multiple');
        }

        if (maxChoice) {
            //always update the correct response then:
            _.forEach(responseDeclaration.getCorrect(), function(c) {
                if (correct.length < maxChoice) {
                    correct.push(c);
                } else {
                    return false;
                }
            });
            responseDeclaration.setCorrect(correct);
        }
    };

    /**
     * Create a tooltip for the given input
     * @param {jQueryElement} $input
     *
     */
    var createTooltip = function createTooltip($input, validatorOptions) {
        var formElementTooltip = tooltip.error($input, ' ', {
            trigger: 'manual',
            container: validatorOptions.$container[0]
        });

        $input.data('$tooltip', formElementTooltip);
        $input.attr('data-has-tooltip',true);

    };
    /**
     * Validation callback, used as a groupvalidator callback
     * @this  {jQueryElement}
     * @param {Boolnean} valid
     * @param {Object} results
     * @param {Object} [validatorOptions]
     */
    var validationCallback = function validationCallback(valid, results, validatorOptions) {

        var rule;
        var $input = $(this);

        if (dom.contains($input)) {

            createTooltip($input, validatorOptions);

            if (!valid) {
                //invalid input!
                rule = _.where(results, {
                    type: 'failure'
                })[0];
                if (rule && rule.data.message && !$('#mediaManager').children('.opened').length) {
                    $input.data('$tooltip').updateTitleContent(rule.data.message)
                    //only show it when the file manager is hidden
                    $input.data('$tooltip').show();
                }

            } else {
                $input.data('$tooltip').hide();
            }
        }
    };


    var formElement = {

        initWidget: function initWidget($form) {
            spinner($form);
            tooltip.lookup($form);
            select2($form);
        },

        /**
         * register attribute change callback functions when associated form elements has been modified
         *
         * @param {Object} $form - the jQuery form element
         * @param {Object} element - a js qti element (see qtiCreator/model)
         * @param {Object} attributes - key value attributeName:callback, e.g. {identifier:function(element, value, attrName){ element.attr(attrName, value); }}
         * @param {Boolean} [options.validateOnInit = false] - define if the validation should be trigger immediately after the callbacks have been set
         * @param {Boolean} [options.invalidate = false] - define if the validation set the valid/invalidate state to the widget of the element
         */
        setChangeCallbacks: function setChangeCallbacks($form, element, attributes, options) {

            var applyCallback = function applyCallback(name, value, $elt) {
                var cb = attributes && attributes[name];
                if (_.isFunction(cb)) {
                    cb.call($elt[0], element, value, name);
                }
            };

            var callbackSimple =  function callbackSimple() {
                var $elt = $(this);
                var name = $elt.attr('name');

                if ($elt.is(':checkbox')) {
                    applyCallback(name, $elt.prop('checked'), $elt);
                } else {
                    applyCallback(name, $elt.val(), $elt);
                }
            };

            var callbackWithValidation = function callbackWithValidation(e, valid, elt) {
                var $elt;
                var name;
                if (e.namespace === 'group') {

                    $elt = $(elt);
                    name = $elt.attr('name');

                    if (valid) {
                        applyCallback(name, $elt.val(), $elt);
                    }
                    if (options.invalidate) {
                        element.data('widget').isValid(name, valid);
                    }
                }
            };

            options = _.defaults(options || {}, {
                validateOnInit: false,
                invalidate: false
            });

            $form.off('.databinding');
            $form.on('change.databinding keyup.databinding', ':checkbox, :radio, select, :text:not([data-validate]), :hidden:not([data-validate])', callbackSimple);
            $form.on('keyup.databinding input.databinding propertychange.databinding', 'textarea', callbackSimple);

            $form.on('validated.group.databinding', callbackWithValidation);

            _.defer(function() {
                $form.groupValidator({
                    validateOnInit: options.validateOnInit,
                    events: ['change', 'blur', {
                        type: 'keyup',
                        length: 0
                    }],
                    callback: validationCallback
                });
            });
        },

        /**
         * Unbind the data change callbacks
         * @param {jQueryElement} $formk
         */
        removeChangeCallback: function removeChangeCallback($form) {
            $form.off('.databinding');
            $form.find(':input[data-has-tooltip]').data('$tooltip').dispose();
            $form.find(':input[data-has-tooltip]').removeAttr('data-has-tooltip').removeData('$tooltip');
        },

        /**
         * the simplest form of save callback used in setChangeCallbacks()
         * @param {boolean} allowEmpty
         */
        getAttributeChangeCallback: function getAttributeChangeCallback(allowEmpty) {

            return function(element, value, name) {
                if (!allowEmpty && value === '') {
                    element.removeAttr(name);
                } else {
                    element.attr(name, value);
                }
            };
        },

        /**
         * Create a coupled callbacks for min and max value change, when both are using the ui/incrementer widget.
         * It is used to update constraints on one when modifying the other.
         *
         * @param {Object} $form - the JQuery object representing the form container
         * @param {String} attributeNameMin
         * @param {String} attributeNameMax
         * @param {Object} options
         * @returns {Object} the list of callbacks
         */
        getMinMaxAttributeCallbacks: function getMinMaxAttributeCallbacks($form, attributeNameMin, attributeNameMax, options) {

            var callbacks = {};

            //prepare options object
            options = _.defaults(options || {}, {
                allowNull: false,
                updateCardinality: true,
                attrMethodNames: {
                    remove: 'removeAttr',
                    set: 'attr'
                },
                floatVal: false,
                callback: _.noop
            });

            callbacks[attributeNameMin] = function(element, value, name) {

                var isActualNumber;
                var max;

                value = options.floatVal ? parseFloat(value) : parseInt(value, 10);
                isActualNumber = !isNaN(value);

                if (!options.allowNull && (value === 0 || !isActualNumber)) {

                    //if a null attribute is not allowed, remove it !
                    element[options.attrMethodNames.remove](name);

                } else if (isActualNumber) {

                    //if the value is an actual number
                    element[options.attrMethodNames.set](name, value);
                }

                options.callback(element, value, name);
            };

            callbacks[attributeNameMax] = function(element, value, name) {

                value = options.floatVal ? parseFloat(value) : parseInt(value, 10) || 0;

                if (element.is('interaction')) {
                    //update response
                    updateResponseDeclaration(element, value, options.updateCardinality);
                }

                if (!value && (element.is('orderInteraction') || element.is('graphicOrderInteraction'))) {
                    element[options.attrMethodNames.remove](name); //to be removed for order interactions
                } else {
                    element[options.attrMethodNames.set](name, value); //required
                }

                options.callback(element, value, name);
            };

            return callbacks;
        }
    };

    return formElement;
});
