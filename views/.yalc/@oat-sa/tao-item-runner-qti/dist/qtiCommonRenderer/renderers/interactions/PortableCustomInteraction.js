define(['lodash', 'handlebars', 'lib/handlebars/helpers', 'taoQtiItem/qtiCommonRenderer/helpers/container', 'taoQtiItem/qtiCommonRenderer/helpers/PortableElement', 'taoQtiItem/qtiCommonRenderer/renderers/interactions/pci/instanciator', 'taoQtiItem/qtiCommonRenderer/renderers/interactions/pci/common', 'taoQtiItem/qtiCommonRenderer/renderers/interactions/pci/ims', 'taoQtiItem/qtiItem/helper/util', 'taoQtiItem/portableElementRegistry/ciRegistry'], function (_, Handlebars, Helpers0, containerHelper, PortableElement, instanciator, commonPciRenderer, imsPciRenderer, util, ciRegistry) { 'use strict';

    _ = _ && Object.prototype.hasOwnProperty.call(_, 'default') ? _['default'] : _;
    Handlebars = Handlebars && Object.prototype.hasOwnProperty.call(Handlebars, 'default') ? Handlebars['default'] : Handlebars;
    Helpers0 = Helpers0 && Object.prototype.hasOwnProperty.call(Helpers0, 'default') ? Helpers0['default'] : Helpers0;
    containerHelper = containerHelper && Object.prototype.hasOwnProperty.call(containerHelper, 'default') ? containerHelper['default'] : containerHelper;
    PortableElement = PortableElement && Object.prototype.hasOwnProperty.call(PortableElement, 'default') ? PortableElement['default'] : PortableElement;
    instanciator = instanciator && Object.prototype.hasOwnProperty.call(instanciator, 'default') ? instanciator['default'] : instanciator;
    commonPciRenderer = commonPciRenderer && Object.prototype.hasOwnProperty.call(commonPciRenderer, 'default') ? commonPciRenderer['default'] : commonPciRenderer;
    imsPciRenderer = imsPciRenderer && Object.prototype.hasOwnProperty.call(imsPciRenderer, 'default') ? imsPciRenderer['default'] : imsPciRenderer;
    util = util && Object.prototype.hasOwnProperty.call(util, 'default') ? util['default'] : util;
    ciRegistry = ciRegistry && Object.prototype.hasOwnProperty.call(ciRegistry, 'default') ? ciRegistry['default'] : ciRegistry;

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
      buffer += "\n    lang=\""
        + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1['xml:lang'])),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
        + "\" ";
      return buffer;
      }

      buffer += "<div class=\"qti-interaction qti-customInteraction\" data-serial=\"";
      if (helper = helpers.serial) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.serial); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      buffer += escapeExpression(stack1)
        + "\" ";
      stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1['xml:lang']), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
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
     * Copyright (c) 2014-2021 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
     *
     */

    var _setPciModel = function _setPciModel(interaction, runtime) {
        var pciRenderer;
        if (runtime.model === 'IMSPCI') {
            pciRenderer = imsPciRenderer(runtime);
        } else {
            pciRenderer = commonPciRenderer(runtime);
        }
        interaction.data('pci-model', runtime.model);
        interaction.data('pci-renderer', pciRenderer);
    };

    var _getPciRenderer = function _getPciRenderer(interaction) {
        return interaction.data('pci-renderer');
    };

    /**
     * Execute javascript codes to bring the interaction to life.
     * At this point, the html markup must already be ready in the document.
     *
     * It is done in 5 steps :
     * 1. configure the paths
     * 2. require all required libs
     * 3. create a pci instance based on the interaction model
     * 4. initialize the rendering
     * 5. restore full state if applicable (state and/or response)
     *
     * @param {Object} interaction
     */
    var render = function render(interaction, options) {
        var self = this;

        options = options || {};
        return new Promise(function (resolve, reject) {
            var id = interaction.attr('responseIdentifier');
            var typeIdentifier = interaction.typeIdentifier;
            var assetManager = self.getAssetManager();
            var state;
            var response = {};

            if (options.state && options.state[id]) {
                state = options.state[id];
            }
            response[id] = { base: null };

            ciRegistry
                .loadRuntimes({ include: [typeIdentifier] })
                .then(function () {
                    var pciRenderer;
                    var runtime = ciRegistry.getRuntime(typeIdentifier);

                    if (!runtime) {
                        return reject('The runtime for the pci cannot be found : ' + typeIdentifier);
                    }

                    _setPciModel(interaction, runtime);

                    pciRenderer = _getPciRenderer(interaction);

                    window.require(
                        pciRenderer.getRequiredModules(),
                        function () {
                            var pci = instanciator.getPci(interaction);
                            if (pci) {
                                pciRenderer.createInstance(interaction, {
                                    response: response,
                                    state: state,
                                    assetManager: assetManager
                                }).then(instance => {
                                    //forward internal PCI event responseChange
                                    if (_.isFunction(instance.on)) {
                                        interaction.onPci('responseChange', function () {
                                            containerHelper.triggerResponseChangeEvent(interaction);
                                        });
                                    }
                                    resolve();
                                });
                            } else {
                                reject('Unable to initialize pci "' + id + '"');
                            }
                        },
                        reject
                    );
                })
                .catch(function (error) {
                    reject('Error loading runtime "' + id + '": ' + error);
                });
        });
    };

    /**
     * Programmatically set the response following the json schema described in
     * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343
     *
     * @param {Object} interaction
     * @param {Object} response
     */
    var setResponse = function setResponse(interaction, response) {
        instanciator.getPci(interaction).setResponse(response);
    };

    /**
     * Get the response in the json format described in
     * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343
     *
     * @param {Object} interaction
     * @returns {Object}
     */
    var getResponse = function getResponse(interaction) {
        return instanciator.getPci(interaction).getResponse();
    };

    /**
     * Remove the current response set in the interaction
     * The state may not be restored at this point.
     *
     * @param {Object} interaction
     */
    var resetResponse = function resetResponse(interaction) {
        instanciator.getPci(interaction).resetResponse();
    };

    /**
     * Reverse operation performed by render()
     * After this function is executed, only the inital naked markup remains
     * Event listeners are removed and the state and the response are reset
     *
     * @param {Object} interaction
     * @returns {Promise?} the interaction destroy step can be async and can return an optional Promise
     */
    var destroy = function destroy(interaction) {
        return _getPciRenderer(interaction).destroy(interaction);
    };

    /**
     * Restore the state of the interaction from the serializedState.
     *
     * @param {Object} interaction
     * @param {Object} serializedState - json format
     */
    var setState = function setState(interaction, serializedState) {
        _getPciRenderer(interaction).setState(interaction, serializedState);
    };

    /**
     * Get the current state of the interaction as a string.
     * It enables saving the state for later usage.
     *
     * @param {Object} interaction
     * @returns {Object} json format
     */
    var getState = function getState(interaction) {
        return _getPciRenderer(interaction).getState(interaction);
    };

    var getData = function getData(customInteraction, data) {
        //remove ns + fix media file path
        var markup = data.markup;
        markup = util.removeMarkupNamespaces(markup);
        markup = PortableElement.fixMarkupMediaSources(markup, this);
        data.markup = markup;

        return data;
    };

    var PortableCustomInteraction = {
        qtiClass: 'customInteraction',
        template: tpl,
        getData: getData,
        render: render,
        getContainer: containerHelper.get,
        setResponse: setResponse,
        getResponse: getResponse,
        resetResponse: resetResponse,
        destroy: destroy,
        getState: getState,
        setState: setState
    };

    return PortableCustomInteraction;

});
