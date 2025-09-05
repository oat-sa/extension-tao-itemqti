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
 * Copyright (c) 2018-2022 Open Assessment Technologies SA
 */

/**
 * Creates a component with a min and a max field
 * that lets you input numeric values in a range.
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'ui/component',
    'ui/incrementer',
    'ui/tooltip',
    'tpl!taoQtiItem/qtiCreator/widgets/component/minMax/minMax'
], function ($, _, __, component, incrementer, tooltip, minMaxTpl) {
    'use strict';

    const defaultConfig = {
        min: {
            //name of the min field
            fieldName: 'minChoices',

            //the actual value
            value: 0,

            //does the field has a toggler
            toggler: true,

            //default help message
            helpMessage: __(
                'The minimum number of choices that the candidate is required to select to form a valid response.'
            ),

            // determines if field can be null
            canBeNull: false,
        },
        max: {
            //name of the max field
            fieldName: 'maxChoices',

            //the actual value
            value: 0,

            //does 0 means unlimited, if yes, we add the toggler
            toggler: true,

            //default help message
            helpMessage: __(
                'The maximum number of choices that the candidate is required to select to form a valid response.'
            ),

            // determines if field can be null
            canBeNull: false,
        },

        //Minimum threshold for both
        lowerThreshold: 1,

        //Arbitrary maximum threshold for both, it's required
        upperThreshold: 4,

        //does the 2 fields sync themselves
        syncValues: true,

        //does the input can have decimal value
        allowDecimal: true
    };

    /**
     * Creates the minMax component
     * @param {HTMLElement|jQueryElement} container - where the component is appended
     * @param {Object} [setUpConfig] - configure the component
     * @param {Object} [setUpConfig.min] - configure the min field
     * @param {String} [setUpConfig.min.fieldName] - the name of the input field
     * @param {Number} [setUpConfig.min.value] - the initial value (should be in range). 0 means disabled.
     * @param {Boolean} [setUpConfig.min.toggler] - allow to enable/disable the field
     * @param {String} [setUpConfig.min.helpMessage] - the message in the field tooltip
     * @param {Number} [setUpConfig.min.lowerThreshold] - lower bound range
     * @param {Number} [setUpConfig.min.upperThreshold] - upper bound range
     * @param {Object} [setUpConfig.max] - configure the max field (see setUpConfig.min)
     * @param {Number} [setUpConfig.lowerThreshold] - lower bound range for both fields
     * @param {Number} [setUpConfig.upperThreshold] - upper bound range for both fields
     * @param {Boolean} [setUpConfig.syncValues] - update values if inconsistencies are detected
     * @param {Boolean} [setUpConfig.hideTooltips] - hide tooltips
     * @returns {minMax} the configured component
     */
    return function minMaxFactory(container, setUpConfig) {
        //keeps inner dom references
        const controls = {
            min: {},
            max: {}
        };

        //field typing
        const fields = {
            min: 'min',
            max: 'max'
        };

        /**
         * Is the field value supported ? yes or exception
         * @param {String} field - min or max
         * @returns {Boolean} true
         * @throws {TypeError} if the field is unknown
         */
        const isFieldSupported = function isFieldSupported(field) {
            if (!_.includes(fields, field)) {
                throw new TypeError(`Unknown field "${field}". Please set "min" or "max"`);
            }
            return true;
        };

        /**
         * The minMax component
         * @typedef {Object} minMax
         */
        const minMax = component(
            {
                /**
                 * Exposes the field values
                 * @returns {Object} the fields
                 */
                getFields: function getFields() {
                    return fields;
                },

                /**
                 * Get the value of a given field
                 * @param {String} field - min or max
                 * @returns {Number} the value
                 * @throws {TypeError} if the field is unknown
                 */
                getValue: function getValue(field) {
                    const config = this.getConfig();

                    if (isFieldSupported(field)) {
                        if (!this.is('rendered')) {
                            return config[field].value;
                        }

                        const inputValue = controls[field].input.val();
                        return inputValue === '' ? null : this.parseNumber(inputValue);
                    }
                },

                /**
                 * Convenience method to the min value
                 * @returns {Number} the value
                 */
                getMinValue: function getMinValue() {
                    return this.getValue(fields.min);
                },

                /**
                 * Convenience method to the max value
                 * @returns {Number} the value
                 */
                getMaxValue: function getMaxValue() {
                    return this.getValue(fields.max);
                },

                /**
                 * Get the lower threshold for a field
                 * @param {String} field - min or max
                 * @returns {Number} the lower threshold value
                 */
                getLowerThreshold: function(field) {
                    const config = this.getConfig();
                    return config[field].lowerThreshold ? config[field].lowerThreshold : config.lowerThreshold;
                },

                /**
                 * Get the upper threshold for a field
                 * @param {String} field - min or max
                 * @returns {Number} the upper threshold value
                 */
                getUpperThreshold: function(field) {
                    const config = this.getConfig();
                    return config[field].upperThreshold ? config[field].upperThreshold : config.upperThreshold;
                },

                /**
                 * Set the value of a given field
                 * @param {String} field - min or max
                 * @param {Number} value - the value to set
                 * @returns {minMax} chains
                 * @throws {TypeError} if the field is unknown
                 */
                setValue: function setValue(field, value) {
                    if (!isFieldSupported(field)) {
                        return this;
                    }

                    const config = this.getConfig();
                    const intValue = this.parseNumber(value);
                    const lowerThreshold = this.getLowerThreshold(field);
                    const upperThreshold = this.getUpperThreshold(field);

                    if (config[field].canBeNull && value === null) {
                        if (this.is('rendered')) {
                            controls[field].input.val('').trigger('change');
                        }
                        config[field].value = null;
                        return this;
                    }

                    if (_.isNumber(intValue) && (intValue >= lowerThreshold) && intValue <= upperThreshold) {
                        if (this.is('rendered') && controls[field].input.val() !== `${intValue}`) {
                            controls[field].input.val(intValue).trigger('change');
                        }

                        config[field].value = intValue;
                    }
                    return this;
                },

                /**
                 * Convenience method to set the min value
                 * @param {Number} value
                 * @returns {minMax} chains
                 */
                setMinValue: function setMinValue(value) {
                    return this.setValue(fields.min, value);
                },

                /**
                 * Convenience method to set the max value
                 * @param {Number} value
                 * @returns {minMax} chains
                 */
                setMaxValue: function setMaxValue(value) {
                    return this.setValue(fields.max, value);
                },

                /**
                 * Update the fields range.
                 * If values aren't consistent we don't apply them.
                 *
                 * @param {Number} lower - the lower bound threshold of both fields
                 * @param {Number} upper - the upper bound threshold of both fields
                 * @param {String} [field] - 'max' or 'min'
                 * @returns {minMax} chains
                 */
                updateThresholds: function updateThresholds(lower, upper, field) {
                    const config = this.getConfig();
                    if (_.isNumber(lower) && _.isNumber(upper) && upper >= lower) {
                        if (!field) {
                            config.lowerThreshold = this.parseNumber(lower);
                            config.upperThreshold = this.parseNumber(upper);

                            if (this.is('rendered')) {
                                const fieldOptions = {
                                    min: config.lowerThreshold,
                                    max: config.upperThreshold
                                };

                                controls.min.input.incrementer('options', fieldOptions);
                                if (this.isFieldEnabled('min')) {
                                    controls.min.input.keyup();
                                }
                                controls.max.input.incrementer('options', fieldOptions);
                                if (this.isFieldEnabled('max')) {
                                    controls.max.input.keyup();
                                }
                            }
                        } else if (field === 'min' || field === 'max') {
                            config[field].lowerThreshold = this.parseNumber(lower);
                            config[field].upperThreshold = this.parseNumber(upper);

                            if (this.is('rendered')) {
                                const fieldOptions = {
                                    min: config[field].lowerThreshold,
                                    max: config[field].upperThreshold
                                };

                                controls[field].input.incrementer('options', fieldOptions);
                                if (this.isFieldEnabled(field)) {
                                    controls[field].input.keyup();
                                }
                            }
                        }
                    }
                    return this;
                },

                /**
                 * Check if a given field is enabled
                 * @param {String} field - min or max
                 * @returns {Boolean} true if enabled, false if disabled
                 * @throws {TypeError} if the field is unknown
                 */
                isFieldEnabled: function isFieldEnabled(field) {
                    const config = this.getConfig();

                    if (isFieldSupported(field)) {
                        //we consider always enabled if the config doesn't allow toggling
                        if (config[field].toggler !== true) {
                            return true;
                        }

                        return config[field].canBeNull ? config[field].value !== null : config[field].value > 0;
                    }
                    return false;
                },

                /**
                 * Enable one of the fields, if the config allow it
                 * @param {String} field - min or max
                 * @param {Number} initialValue
                 * @returns {minMax} chains
                 * @throws {TypeError} if the field is unknown
                 * @fires  minMax#enablemin
                 * @fires  minMax#enablemax
                 */
                enableField: function enableField(field, initialValue) {
                    if (isFieldSupported(field) && this.is('rendered')) {
                        const config = this.getConfig();

                        let valueToSet;
                        if (config[field].canBeNull) {
                            valueToSet = initialValue >= 0 ? initialValue : 0;
                        } else {
                            valueToSet = initialValue > 1 ? initialValue : 1;
                        }

                        controls[field].input
                            .val(valueToSet)
                            .incrementer('enable')
                            .trigger('change');

                        /**
                         * One of the field is enabled
                         * @event minMax#enablemin
                         * @event minMax#enablemax
                         */
                        this.trigger(`enable${field}`);

                        //enabling can create inconsistencies
                        this.syncValues();
                    }
                    return this;
                },

                /**
                 * Disable one of the fields, if the config allow it
                 * @param {String} field - min or max
                 * @returns {minMax} chains
                 * @throws {TypeError} if the field is unknown
                 * @fires  minMax#disablemin
                 * @fires  minMax#disablemax
                 */
                disableField: function disableField(field) {
                    const config = this.getConfig();

                    if (
                        isFieldSupported(field) &&
                        this.is('rendered') &&
                        config[field].toggler === true
                    ) {
                        config[field].value = config[field].canBeNull ? null : 0;
                        controls[field].input
                            .val(config[field].canBeNull ? '' : 0)
                            .incrementer('disable')
                            .trigger('change');

                        /**
                         * One of the field is enabled
                         * @event minMax#disablemin
                         * @event minMax#disablemax
                         */
                        this.trigger(`disable${field}`);
                    }
                    return this;
                },

                /**
                 * Prevent inconsistencies between both fields' values
                 * @param {String} [fromField = min] - min or max, where the change comes from to update accordingly
                 * @returns {minMax} chains
                 * @throws {TypeError} if the field is unknown
                 */
                syncValues: function syncValues(fromField) {
                    const config = this.getConfig();

                    fromField = fromField || fields.min;

                    if (isNaN(this.getMinValue())) {
                        this.setMinValue(this.getLowerThreshold(fromField));
                    }
                    if (isNaN(this.getMaxValue())) {
                        this.setMaxValue(this.getLowerThreshold(fromField));
                    }

                    if (!isFieldSupported(fromField) || !this.is('rendered') || !config.syncValues) {
                        return this;
                    }

                    const minValue = this.getMinValue();
                    const maxValue = this.getMaxValue();

                    if (minValue > 0 && maxValue >= 0) {
                        if (fromField === fields.max && minValue > maxValue) {
                            _.isNumber(maxValue) && this.isFieldEnabled('min') && this.setMinValue(maxValue);
                        }
                        if (fromField === fields.min && minValue > maxValue) {
                            _.isNumber(maxValue) && this.isFieldEnabled('min') && this.setMaxValue(minValue);
                        }
                    }
                    if (
                        minValue === 0 &&
                        maxValue > 0 &&
                        (document.querySelector('.edit-active > .qti-orderInteraction') ||
                            document.querySelector('.edit-active > .qti-graphicOrderInteraction'))
                    ) {
                        this.enableField(fields.min, this.getLowerThreshold(fields.min) || 1);
                        controls.min.toggler.prop('checked', true);
                    }
                    return this;
                },

                /**
                 * convert value to number
                 *
                 * @param {String} [fromField = min] - min or max, where the change comes from to update accordingly
                 * @returns {minMax} chains
                 * @throws {TypeError} if the field is unknown
                 */
                convertToNumber: function convertToNumber(fromField) {
                    if (isFieldSupported(fromField) && this.is('rendered')) {
                        if (fromField === fields.max) {
                            this.setMaxValue(this.parseNumber(this.getMaxValue()));
                        } else {
                            this.setMinValue(this.parseNumber(this.getMinValue()));
                        }
                    }

                    return this;
                },

                parseNumber: function parseNumber(value) {
                    const config = this.getConfig();
                    if (config.allowDecimal) {
                        return parseFloat(value);
                    }
                    return parseInt(value);
                },

                /**
                 * disabe toggler
                 *
                 * @param {String} [fromField = min] - min or max, where the change comes from to update accordingly
                 * @returns {minMax} chains
                 */
                disableToggler: function disableToggler(fromField) {
                    if (isFieldSupported(fromField) && this.is('rendered') && controls[fromField].toggler) {
                        controls[fromField].toggler.prop('disabled', true);
                    }

                    return this;
                },

                /**
                 * enable toggler
                 *
                 * @param {String} [fromField = min] - min or max, where the change comes from to update accordingly
                 * @returns {minMax} chains
                 */
                enableToggler: function disableToggler(fromField) {
                    if (isFieldSupported(fromField) && this.is('rendered') && controls[fromField].toggler) {
                        controls[fromField].toggler.prop('disabled', false);
                    }

                    return this;
                }
            },
            defaultConfig
        )
            .setTemplate(minMaxTpl)
            .on('init', function () {
                if (container) {
                    this.render(container);
                }
            })
            .on('render', function () {
                const self = this;
                const $element = this.getElement();
                const config = this.getConfig();

                /**
                 * Setup the listener on the input and the toggler if allowed
                 * @param {String} field - min or max
                 */
                const setUpFieldListener = function setUpFieldListener(field) {
                    if (isFieldSupported(field)) {
                        const fieldConfig = config[field];
                        const fieldControl = controls[field];

                        fieldControl.input = $(`[name=${fieldConfig.fieldName}]`, $element);

                        if (fieldConfig.toggler) {
                            fieldControl.toggler = $(`[name=${fieldConfig.fieldName}-toggler]`, $element);

                            const shouldEnableField = fieldConfig.canBeNull
                                ? fieldConfig.value !== null
                                : fieldConfig.value > 0;

                            if (shouldEnableField) {
                                fieldControl.toggler.prop('checked', true);
                            } else {
                                fieldControl.toggler.prop('checked', false);
                                self.disableField(field);
                            }

                            //set up the toggle handler
                            fieldControl.toggler.on('change', function () {
                                if ($(this).prop('checked')) {
                                    self.enableField(
                                        field,
                                        Math.max(
                                            fieldConfig.canBeNull ? 0 : (self.getLowerThreshold(field) || 1),
                                            self.getMinValue()
                                        )
                                    );
                                } else {
                                    self.disableField(field);
                                }

                                self.trigger('change');
                            });
                        }

                        fieldControl.input.on('change', function () {
                            self.syncValues(field);
                            self.convertToNumber(field);
                            self.trigger('change');
                        });
                    }
                };

                //set up the tools relying on data-attr
                incrementer($element);
                tooltip.lookup($element);

                setUpFieldListener(fields.min);
                setUpFieldListener(fields.max);

                //check and change the initial values
                this.syncValues();
            });

        _.defer(function () {
            //we need to simulate a deep merge
            const deepConfig = _.cloneDeep(setUpConfig || {});
            if (deepConfig.min) {
                deepConfig.min = _.defaults(setUpConfig.min, defaultConfig.min);
            }
            if (deepConfig.max) {
                deepConfig.max = _.defaults(setUpConfig.max, defaultConfig.max);
            }
            minMax.init(deepConfig);
        });

        return minMax;
    };
});
