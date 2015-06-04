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
 * Copyright (c) 2014 (original work) Open Assessment Technlogies SA (under the project TAO-PRODUCT);
 *
 */

/**
 * Helps you to load and change item runner  themes at runtime
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define(['jquery', 'lodash'], function($, _){
    'use strict';

    //used to differenciate the stylesheets
    var prefix = 'qti-item-style-';

    //where to attach the stylesheets
    var $container = $('head').length ? $('head') : $('body');

    /**
     * Create a stylesheet tag
     * @param {String} name - to identify this tag
     * @param {String} location - for the href
     * @return {jQueryElement} the link node
     */
    var createStyleSheet  = function createStyleSheet(name, location){
        var type = (name === 'base') ? prefix + 'base' : prefix + 'theme';
        return $('<link>')
                    .attr({
                        rel         : 'stylesheet',
                        type        : 'text/css',
                        href        : location,
                        'data-type' : type,
                        'data-name' : name,
                    });
    };

    /**
     * Get the stylesheet
     * @param {String} name - the stylesheet/theme name
     * @returns {jQueryElement} the link
     */
    var getLink = function getLink(name){
        return $('link[data-name="' + name + '"][data-type^="' + prefix + '"]', $container);
    };

    /**
     * Is the stylesheet attached to the container ?
     * @param {String} name - the stylesheet/theme name
     * @param {Boolean} [disabled = false] - is the stylesheet disabled
     */
    var isAttached = function isAttached(name){
        return getLink(name).length > 0;
    };

    /**
     * Enable some nodes
     * @param {jQueryElement} $nodes - the nodes to enable
     * @returns {jQueryElement}
     */
    var enable = function enable($nodes){
        $nodes.prop('disabled', false)
              .removeAttr('disabled');
    };

    /**
     * Disable some nodes
     * @param {jQueryElement} $nodes - the nodes to disable
     * @returns {jQueryElement}
     */
    var disable = function enable($nodes){
        return $nodes.prop('disabled', true)
                     .attr('disabled', true);    //add attr only for easiest inspection
    };

    /**
     * The themeLoader is a factory that returns a loader. Configured to load the given styles.
     *
     * @param {Object} config - the themes configuration
     * @param {String} config.base - the location of the base style
     * @param {String} [config.default] - the name of the default theme (one of the key of the available list )
     * @param {Object} config.available - the list of available themes as { themeName : theLocation, ...}
     * @returns {Object} the loader
     * @throws TypeError if the config hasn't the correct form
     */
    var themeLoader = function themeLoader(config){

        var defaultTheme;
        var styles = {};

        /*
         * validate config
         */
        if(!_.isPlainObject(config)){
            throw new TypeError('Theme loader configuration is required');
        }

        if(!_.isString(config.base)){
            throw new TypeError('Theme loader configuration is an object with a base property configuration');
        }

        if(!_.isPlainObject(config.available) || _.size(config.available) === 0 ){
            throw new TypeError('No theme declared in the configuration');
        }


        /*
         * Extract data from config
         */
        defaultTheme = config.default || _.first(_.keys(config.available));

        _.forEach(_.merge({}, { 'base' : config.base }, config.available), function(location, name){
            if(isAttached(name)){
                styles[name] = getLink(name);
            } else {
                styles[name] = createStyleSheet(name, location);
            }
        });

        /**
         * The loader instance
         */
        return {

            /**
             * Load the themes
             * @returns {Object} chains
             */
            load : function load(){
                _.forEach(styles, function($link, name){
                    if(!isAttached(name)){
                        $container.append($link);
                    }
                    if(name !== 'base' && name !== defaultTheme){
                        disable($link);
                    } else {
                        enable($link);
                    }
                });
                return this;
            },

            /**
             * Unload the stylesheets (disable them)
             * @returns {Object} chains
             */
            unload : function unload(){
                disable($('link[data-type^="' + prefix  + '"]', $container));

                return this;
            },

            /**
             * Change the current theme
             * @param {String} theme - the theme name to use
             * @returns {Object} chains
             */
            change : function change(theme){
                if(isAttached(theme)){
                    //diable all
                    disable($('link[data-type="' + prefix  + 'theme"]', $container));

                    //enable the theme only
                    enable(getLink(theme));
                }
                return this;
            }
        };
    };

    /**
     * @exports taoQtiItem/qtiRunner/themes/loader
     */
    return themeLoader;
});
