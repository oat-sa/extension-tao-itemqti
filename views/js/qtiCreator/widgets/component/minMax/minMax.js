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
 * Copyright (c) 2018 Open Assessment Technologies SA
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
], function($, _, __, component, incrementer, tooltip, minMaxTpl){
    'use strict';

    var defaultConfig = {
        min : {
            //name of the min field
            fieldName:     'minChoices',

            //the actual value
            value:         0,

            //does the field has a toggler
            toggler: true,

            //default help message
            helpMessage:   __('The minimum number of choices that the candidate is required to select to form a valid response.')
        },
        max : {
            //name of the max field
            fieldName:     'maxChoices',

            //the actual value
            value:         0,

            //does 0 means unlimited, if yes, we add the toggler
            toggler: true,

            //default help message
            helpMessage:   __('The maximum number of choices that the candidate is required to select to form a valid response.'),

        },

        //Minimum threshold for both
        lowerThreshold:     1,

        //Arbitrary maximum threshold for both, it's required
        upperThreshold:     4,

        //does the 2 fields sync themselves
        syncValues:       true
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
     * @param {Object} [setUpConfig.max] - configure the max field (see setUpConfig.min)
     * @param {Number} [setUpConfig.lowerThreshold] - lower bound range for both fields
     * @param {Number} [setUpConfig.upperThreshold] - upper bound range for both fields
     * @param {Boolean} [setUpConfig.syncValues] - update values if inconsistencies are detected
     * @returns {minMax} the configured component
     */
    return function minMaxFactory(container, setUpConfig) {

        //keeps inner dom references
        var controls = {
            min : {},
            max : {}
        };

        //field typing
        var fields =  {
            min : 'min',
            max : 'max'
        };

        /**
         * Is the field value supported ? yes or exception
         * @param {String} field - min or max
         * @returns {Boolean} true
         * @throws {TypeError} if the field is unknown
         */
        var isFieldSupported = function isFieldSupported(field){
            if (! _.contains(fields, field) ) {
                throw new TypeError('Unknown field "' + field + '". Please set "min" or "max"');
            }
            return true;
        };

        /**
         * The minMax component
         * @typedef {Object} minMax
         */
        var minMax = component({

            /**
             * Exposes the field values
             * @returns {Object} the fields
             */
            getFields : function getFields(){
                return fields;
            },

            /**
             * Get the value of a given field
             * @param {String} field - min or max
             * @returns {Number} the value
             * @throws {TypeError} if the field is unknown
             */
            getValue : function getValue(field){
                var config = this.getConfig();

                if ( isFieldSupported(field) ) {

                    if ( this.is('rendered') ) {
                        return _.parseInt(controls[field].input.val());
                    }

                    return config[field].value;
                }
            },

            /**
             * Convenience method to the min value
             * @returns {Number} the value
             */
            getMinValue : function getMinValue(){
                return this.getValue(fields.min);
            },

            /**
             * Convenience method to the max value
             * @returns {Number} the value
             */
            getMaxValue : function getMaxValue(){
                return this.getValue(fields.max);
            },

            /**
             * Set the value of a given field
             * @param {String} field - min or max
             * @param {Number} value - the value to set
             * @returns {minMax} chains
             * @throws {TypeError} if the field is unknown
             */
            setValue : function setValue(field, value){
                var config = this.getConfig();
                var intValue = _.parseInt(value);

                if ( isFieldSupported(field) && _.isNumber(intValue) &&
                     intValue >= config.lowerThreshold && intValue <= config.upperThreshold ) {

                    if ( this.is('rendered') && controls[field].input.val() !== intValue ) {
                        return controls[field].input.val(intValue).trigger('change');
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
            setMinValue : function setMinValue(value){
                return this.setValue(fields.min, value);
            },

            /**
             * Convenience method to set the max value
             * @param {Number} value
             * @returns {minMax} chains
             */
            setMaxValue : function setMaxValue(value){
                return this.setValue(fields.max, value);
            },

            /**
             * Update the fields range.
             * If values aren't consistent we don't apply them.
             *
             * @param {Number} lower - the lower bound threshold of both fields
             * @param {Number} upper - the upper bound threshold of both fields
             * @returns {minMax} chains
             */
            updateThresholds : function updateThresholds(lower, upper) {
                var config = this.getConfig();
                var fieldOptions;
                if(_.isNumber(lower) && _.isNumber(upper) && upper > lower) {
                    config.lowerThreshold = _.parseInt(lower);
                    config.upperThreshold = _.parseInt(upper);

                    if(this.is('rendered')){
                        fieldOptions = {
                            min : config.lowerThreshold,
                            max : config.upperThreshold,
                        };

                        controls.min.input.incrementer('options', fieldOptions);
                        if(this.isFieldEnabled('min')){
                            controls.min.input.keyup();
                        }
                        controls.max.input.incrementer('options', fieldOptions);
                        if(this.isFieldEnabled('max')){
                            controls.max.input.keyup();
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
            isFieldEnabled : function isFieldEnabled(field) {
                var config = this.getConfig();

                if ( isFieldSupported(field) ) {

                    //we consider always enabled if the config doesn't allow toggling
                    if( config[field].toggler !== true ){
                        return true;
                    }

                    return this.getValue(field) > 0;
                }
                return false;
            },

            /**
             * Enable one of the fields, if the config allow it
             * @param {String} field - min or max
             * @returns {minMax} chains
             * @throws {TypeError} if the field is unknown
             * @fires  minMax#enablemin
             * @fires  minMax#enablemax
             */
            enableField : function enableField(field, initialValue){

                if ( isFieldSupported(field) && this.is('rendered') && !this.isFieldEnabled(field) ) {

                    controls[field].input
                        .val( initialValue > 1 ? initialValue : 1 )
                        .incrementer('enable')
                        .trigger('change');

                    /**
                     * One of the field is enabled
                     * @event minMax#enablemin
                     * @event minMax#enablemax
                     */
                    this.trigger('enable' + field);

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
            disableField : function disableField(field){
                var config = this.getConfig();

                if ( isFieldSupported(field) && this.is('rendered') &&
                     config[field].toggler === true && this.isFieldEnabled(field) ) {

                    controls[field].input
                        .val( 0 )
                        .incrementer('disable')
                        .trigger('change');

                    /**
                     * One of the field is enabled
                     * @event minMax#disablemin
                     * @event minMax#disablemax
                     */
                    this.trigger('disable' + field);

                }
                return this;
            },

            /**
             * Prevent inconsistencies between both fields' values
             * @param {String} [fromField = min] - min or max, where the change comes from to update accordingly
             * @returns {minMax} chains
             * @throws {TypeError} if the field is unknown
             */
            syncValues : function syncValues(fromField){
                var minValue;
                var maxValue;
                var config = this.getConfig();

                fromField = fromField || fields.min;

                if ( isFieldSupported(fromField) && this.is('rendered')  && config.syncValues) {

                    minValue = this.getMinValue();
                    maxValue = this.getMaxValue();

                    if( minValue > 0 && maxValue > 0) {

                        if(fromField === fields.max && minValue > maxValue){
                            this.setMinValue(maxValue);
                        }
                        if(fromField === fields.min && minValue > maxValue){
                            this.setMaxValue(minValue);
                        }
                    }
                }
                return this;
            },

        }, defaultConfig)
            .setTemplate(minMaxTpl)
            .on('init', function(){
                if(container){
                    this.render(container);
                }
            })
            .on('render', function(){
                var self     = this;
                var $element = this.getElement();
                var config   = this.getConfig();

                /**
                 * Setup the listener on the input and the toggler if allowed
                 * @param {String} field - min or max
                 */
                var setUpFieldListener = function setUpFieldListener(field){
                    var fieldConfig;
                    var fieldControl;

                    if ( isFieldSupported(field) ){
                        fieldConfig = config[field];
                        fieldControl = controls[field];

                        fieldControl.input = $('[name=' + fieldConfig.fieldName + ']', $element);

                        if(fieldConfig.toggler){
                            fieldControl.toggler = $('[name=' + fieldConfig.fieldName + '-toggler]', $element);

                            //does the toggler starts checked ?
                            if(fieldConfig.value > 0){
                                fieldControl.toggler.prop('checked', true);
                            } else {
                                self.disableField(field);
                            }

                            //set up the toggle handler
                            fieldControl.toggler.on('change', function(){
                                if( $(this).prop('checked') ) {
                                    self.enableField(field, Math.max(1, self.getMinValue()));
                                } else {
                                    self.disableField(field);
                                }

                                self.trigger('change');
                            });
                        }

                        fieldControl.input.on('change', function(){
                            self.syncValues(field);

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

        _.defer(function(){
            //we need to simulate a deep merge
            var deepConfig = _.cloneDeep(setUpConfig || {});
            if(deepConfig.min){
                deepConfig.min = _.defaults(setUpConfig.min, defaultConfig.min);
            }
            if(deepConfig.max){
                deepConfig.max = _.defaults(setUpConfig.max, defaultConfig.max);
            }
            minMax.init(deepConfig);
        });

        return minMax;
    };
});

