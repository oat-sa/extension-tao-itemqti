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
 * Copyright (c) 2015-2022 (original work) Open Assessment Technologies SA;
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
], function ($, _, __, Element, dom, spinner, tooltip, select2) {
    'use strict';

    /**
     * Update response declaration
     * @param {Object} interaction
     * @param {Number} maxChoice
     * @param {Boolean} [updateCardinality=true]
     * @throws {Error} if the element is not an interaction
     */
    function updateResponseDeclaration(interaction, maxChoice, updateCardinality) {
        let responseDeclaration;
        const correct = [];

        if (!Element.isA(interaction, 'interaction')) {
            throw new Error(
                `The first argument must be an interaction, the current element is ${interaction.qtiClass}`
            );
        }

        updateCardinality = typeof updateCardinality === 'undefined' ? true : !!updateCardinality;
        responseDeclaration = interaction.getResponseDeclaration();
        if (updateCardinality) {
            responseDeclaration.attr('cardinality', maxChoice === 1 ? 'single' : 'multiple');
        }

        if (maxChoice) {
            //always update the correct response then:
            _.forEach(responseDeclaration.getCorrect(), function (c) {
                if (correct.length < maxChoice) {
                    correct.push(c);
                } else {
                    return false;
                }
            });
            responseDeclaration.setCorrect(correct);
        }
    }

    /**
     * Create a tooltip for the given input
     * @param {jQueryElement} $input
     *
     */
    function createTooltip($input) {
        const formElementTooltip = tooltip.error($input, ' ', {
            trigger: 'manual'
        });

        if ($input.data('$tooltip')) {
            $input.data('$tooltip').dispose();
            $input.removeData('$tooltip');
        }

        $input.siblings('.tooltip.tooltip-red').remove();

        $input.data('$tooltip', formElementTooltip);
        $input.attr('data-has-tooltip', true);
    }

    /**
     * Validation callback, used as a groupvalidator callback
     * @this  {jQueryElement}
     * @param {Boolnean} valid
     * @param {Object} results
     * @param {Object} [validatorOptions]
     */
    function validationCallback(valid, results, validatorOptions) {
        let rule;
        const $input = $(this);

        if (dom.contains($input)) {
            createTooltip($input, validatorOptions);

            if (!valid) {
                //invalid input!
                rule = _.filter(results, {
                    type: 'failure'
                })[0];
                if (rule && rule.data.message && !$('#mediaManager').children('.opened').length) {
                    $input.data('$tooltip').updateTitleContent(rule.data.message);
                    //only show it when the file manager is hidden
                    $input.data('$tooltip').show();
                }
            } else {
                $input.data('$tooltip').hide();
            }
        }
    }

    /**
     * Prepares options object
     * @param {Object} options
     */
    function getAttrsOptions(options) {
        return _.defaults(options || {}, {
            allowNull: false,
            updateCardinality: true,
            attrMethodNames: {
                remove: 'removeAttr',
                set: 'attr'
            },
            floatVal: false,
            callback: _.noop
        });
    }

    /**
     * Callback for min value change
     * @param {Element} element
     * @param {String} value - attribute value
     * @param {String} name - attribute name
     * @param {Object} options
     */
    function minCallback(element, value, name, options) {
        const numericValue = options.floatVal ? parseFloat(value) : parseInt(value, 10);
        let isActualNumber = !isNaN(numericValue);

        if (!options.allowNull && (numericValue === 0 || !isActualNumber)) {
            //if a null attribute is not allowed, remove it !
            element[options.attrMethodNames.remove](name);
        } else if (isActualNumber) {
            //if the value is an actual number
            element[options.attrMethodNames.set](name, numericValue);
        }

        options.callback(element, numericValue, name);
    }

    const formElement = {
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
         * @param {Object} options
         * @param {Boolean} [options.validateOnInit=false] - define if the validation should be trigger immediately after the callbacks have been set
         * @param {Boolean} [options.invalidate=false] - define if the validation set the valid/invalidate state to the widget of the element
         */
        setChangeCallbacks: function ($form, element, attributes, options) {
            const applyCallback = function applyCallback(name, value, $elt) {
                const cb = attributes && attributes[name];
                if (_.isFunction(cb)) {
                    cb.call($elt[0], element, value, name);
                }
            };

            const callbackSimple = function callbackSimple() {
                const $elt = $(this);
                const name = $elt.attr('name');

                if ($elt.is(':checkbox')) {
                    applyCallback(name, $elt.prop('checked'), $elt);
                } else {
                    applyCallback(name, $elt.val(), $elt);
                }
            };

            const callbackWithValidation = function callbackWithValidation(e, valid, elt) {
                let $elt;
                let name;
                if (e.namespace === 'group') {
                    $elt = $(elt);
                    name = $elt.attr('name');

                    if (valid || options.saveInvalid) {
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
            $form.on(
                'change.databinding keyup.databinding',
                ':checkbox, :radio, select, :text:not([data-validate]), :hidden:not([data-validate])',
                callbackSimple
            );
            $form.on('keyup.databinding input.databinding propertychange.databinding', 'textarea', callbackSimple);

            $form.on('validated.group.databinding', callbackWithValidation);

            _.defer(function () {
                $form.groupValidator({
                    validateOnInit: options.validateOnInit,
                    events: [
                        'change',
                        'blur',
                        {
                            type: 'keyup',
                            length: 0
                        }
                    ],
                    callback: validationCallback
                });
            });
        },

        /**
         * Unbind the data change callbacks
         * @param {jQueryElement} $form
         */
        removeChangeCallback: function ($form) {
            $form.off('.databinding');
            $form.find(':input[data-has-tooltip]').data('$tooltip').dispose();
            $form.find(':input[data-has-tooltip]').removeAttr('data-has-tooltip').removeData('$tooltip');
            $form.find('.tooltip.tooltip-red').remove();
        },

        /**
         * the simplest form of save callback used in setChangeCallbacks()
         * @param {boolean} allowEmpty
         * @returns {function} - the callback function to be called elsewhere
         */
        getAttributeChangeCallback: function (allowEmpty) {
            return function (element, value, name) {
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
         * @param {String} attributeNameMin
         * @param {String} attributeNameMax
         * @param {Object} options
         * @returns {Object} the list of callbacks
         */
        getMinMaxAttributeCallbacks: function (attributeNameMin, attributeNameMax, options) {
            const callbacks = {};
            options = getAttrsOptions(options);

            callbacks[attributeNameMin] = (element, value, name) => {
                minCallback(element, value, name, options);
            };

            callbacks[attributeNameMax] = function (element, value, name) {
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
        },

        /**
         * Create a coupled callbacks for lower and upper bounds value change, when both are using the ui/incrementer widget.
         * It is used to update constraints on one when modifying the other.
         *
         * @param {String} attributeNameLower
         * @param {String} attributeNameUpper
         * @param {Object} options
         * @returns {Object} the list of callbacks
         */
        getLowerUpperAttributeCallbacks: function (attributeNameLower, attributeNameUpper, options) {
            const callbacks = {};
            options = getAttrsOptions(options);

            callbacks[attributeNameLower] = (element, value, name) => {
                minCallback(element, value, name, options);
            };

            callbacks[attributeNameUpper] = function (element, value, name) {
                value = options.floatVal ? parseFloat(value) : parseInt(value, 10) || 0;

                if (element.is('interaction')) {
                    //update response
                    updateResponseDeclaration(element, value, options.updateCardinality);
                }

                if (this.disabled) {
                    // if the field is disabled, the corresponding attribute should be removed.
                    element[options.attrMethodNames.remove](name);
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
