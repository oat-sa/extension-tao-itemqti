define(['lodash', 'handlebars', 'lib/handlebars/helpers', 'taoQtiItem/qtiCommonRenderer/helpers/container', 'taoQtiItem/qtiCommonRenderer/helpers/PortableElement', 'qtiInfoControlContext', 'taoQtiItem/qtiItem/helper/util', 'taoQtiItem/portableElementRegistry/icRegistry'], function (_, Handlebars, Helpers0, containerHelper, PortableElement, qtiInfoControlContext, util, icRegistry) { 'use strict';

    _ = _ && Object.prototype.hasOwnProperty.call(_, 'default') ? _['default'] : _;
    Handlebars = Handlebars && Object.prototype.hasOwnProperty.call(Handlebars, 'default') ? Handlebars['default'] : Handlebars;
    Helpers0 = Helpers0 && Object.prototype.hasOwnProperty.call(Helpers0, 'default') ? Helpers0['default'] : Helpers0;
    containerHelper = containerHelper && Object.prototype.hasOwnProperty.call(containerHelper, 'default') ? containerHelper['default'] : containerHelper;
    PortableElement = PortableElement && Object.prototype.hasOwnProperty.call(PortableElement, 'default') ? PortableElement['default'] : PortableElement;
    qtiInfoControlContext = qtiInfoControlContext && Object.prototype.hasOwnProperty.call(qtiInfoControlContext, 'default') ? qtiInfoControlContext['default'] : qtiInfoControlContext;
    util = util && Object.prototype.hasOwnProperty.call(util, 'default') ? util['default'] : util;
    icRegistry = icRegistry && Object.prototype.hasOwnProperty.call(icRegistry, 'default') ? icRegistry['default'] : icRegistry;

    if (!Helpers0.__initialized) {
      Helpers0(Handlebars);
      Helpers0.__initialized = true;
    }
    var Template = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
      this.compilerInfo = [4,'>= 1.0.0'];
    helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
      var buffer = "", stack1, helper, functionType="function", escapeExpression=this.escapeExpression, self=this;

    function program1(depth0,data) {
      
      var buffer = "", stack1;
      buffer += " "
        + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1['class'])),typeof stack1 === functionType ? stack1.apply(depth0) : stack1));
      return buffer;
      }

    function program3(depth0,data) {
      
      var buffer = "", stack1;
      buffer += " lang=\""
        + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1['xml:lang'])),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
        + "\"";
      return buffer;
      }

      buffer += "<div class=\"qti-infoControl";
      stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1['class']), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "\" data-serial=\"";
      if (helper = helpers.serial) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.serial); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      buffer += escapeExpression(stack1)
        + "\"";
      stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1['xml:lang']), {hash:{},inverse:self.noop,fn:self.program(3, program3, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += ">\n    ";
      if (helper = helpers.markup) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.markup); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "\n</div>";
      return buffer;
      });
    function tpl(data, options, asString) {
      var html = Template(data, options);
      return (asString || true) ? html : $(html);
    }

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
     * Copyright (c) 2015 (original work) Open Assessment Technologies SA
     *
     */

    /**
     * Get the PIC instance associated to the infoControl object
     * If none exists, create a new one based on the PIC typeIdentifier
     *
     * @param {Object} infoControl - the js object representing the infoControl
     * @returns {Object} PIC instance
     */
    var _getPic = function(infoControl) {
        var typeIdentifier,
            pic = infoControl.data('pic') || undefined;

        if (!pic) {
            typeIdentifier = infoControl.typeIdentifier;
            pic = qtiInfoControlContext.createPciInstance(typeIdentifier);

            if (pic) {
                //binds the PIC instance to TAO infoControl object and vice versa
                infoControl.data('pic', pic);
                pic._taoInfoControl = infoControl;
            } else {
                throw 'no custom infoControl hook found for the type ' + typeIdentifier;
            }
        }

        return pic;
    };

    /**
     * Execute javascript codes to bring the infoControl to life.
     * At this point, the html markup must already be ready in the document.
     *
     * It is done in 5 steps :
     * 1. ensure the context is configured correctly
     * 2. require all required libs
     * 3. create a pic instance based on the infoControl model
     * 4. initialize the rendering
     * 5. restore full state if applicable
     *
     * @param {Object} infoControl
     * @param {Object} [options]
     */
    var render = function(infoControl, options) {
        var self = this;
        return new Promise(function(resolve, reject) {
            var state = {}; //@todo pass state and response to renderer here:
            var id = infoControl.attr('id');
            var typeIdentifier = infoControl.typeIdentifier;
            var config = infoControl.properties;
            var $dom = containerHelper.get(infoControl).children();
            var assetManager = self.getAssetManager();

            icRegistry
                .loadRuntimes()
                .then(function() {
                    var requireEntries = [];
                    var runtime = icRegistry.getRuntime(typeIdentifier);

                    if (!runtime) {
                        return reject('The runtime for the pic cannot be found : ' + typeIdentifier);
                    }

                    //load the entrypoint, becomes optional per IMS PCI v1
                    if (runtime.hook) {
                        requireEntries.push(runtime.hook.replace(/\.js$/, ''));
                    }

                    //load required libraries
                    _.forEach(runtime.libraries, function(module) {
                        requireEntries.push(module.replace(/\.js$/, ''));
                    });

                    //load stylesheets
                    _.forEach(runtime.stylesheets, function(stylesheet) {
                        requireEntries.push('css!' + stylesheet.replace(/\.css$/, ''));
                    });

                    //load the entrypoint
                    window.require(requireEntries, function() {
                        var pic = _getPic(infoControl);
                        var picAssetManager = {
                            resolve: function resolve(url) {
                                var resolved = assetManager.resolveBy('portableElementLocation', url);
                                if (resolved === url) {
                                    return assetManager.resolveBy('baseUrl', url);
                                } else {
                                    return resolved;
                                }
                            }
                        };

                        if (pic) {
                            //call pic initialize() to render the pic
                            pic.initialize(id, $dom[0], config, picAssetManager);
                            //restore context (state + response)
                            pic.setSerializedState(state);

                            return resolve();
                        }

                        return reject('Unable to initialize pic : ' + id);
                    }, reject);
                })
                .catch(function(error) {
                    reject('Error loading runtime : ' + id);
                });
        });
    };

    /**
     * Reverse operation performed by render()
     * After this function is executed, only the inital naked markup remains
     * Event listeners are removed and the state and the response are reset
     *
     * @param {Object} infoControl
     */
    var destroy = function destroy(infoControl) {
        _getPic(infoControl).destroy();
    };

    /**
     * Restore the state of the infoControl from the serializedState.
     *
     * @param {Object} infoControl - the element instance
     * @param {Object} state - the state to set
     */
    var setState = function setState(infoControl, state) {
        _getPic(infoControl).setSerializedState(state);
    };

    /**
     * Get the current state of the infoControl as a string.
     * It enables saving the state for later usage.
     *
     * @param {Object} infoControl - the element instance
     * @returns {Object} the state
     */
    var getState = function getState(infoControl) {
        return _getPic(infoControl).getSerializedState();
    };

    var PortableInfoControl = {
        qtiClass: 'infoControl',
        template: tpl,
        getData: function(infoControl, data) {
            //remove ns + fix media file path
            var markup = data.markup;
            markup = util.removeMarkupNamespaces(markup);
            markup = PortableElement.fixMarkupMediaSources(markup, this);
            data.markup = markup;
            return data;
        },
        render: render,
        getContainer: containerHelper.get,
        destroy: destroy,
        getState: getState,
        setState: setState
    };

    return PortableInfoControl;

});
