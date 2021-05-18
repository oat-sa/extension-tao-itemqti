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
 * Copyright (c) 2015 (original work) Open Assessment Technologies SA ;
 */
define([
    'lodash',
    'taoQtiItem/qtiCommonRenderer/renderers/Renderer',
    'taoQtiItem/qtiCommonRenderer/helpers/container'
], function(_, Renderer, containerHelper){
    "use strict";

    //store the current execution context of the common renderer (preview)
    var _$previousContext = null;

    //configure and instanciate once only:
    var _renderer;

    var commonRenderer = {
        render : function(item, $container){

            commonRenderer.setContext($container);

            return _renderer.load(function(){

                $container.append(item.render(this));
                item.postRender({}, '', this);

            }, item.getUsedClasses());
        },
        get : function(reset, config){
            if(!_renderer || reset){

                //create new instance of common renderer
                _renderer = new Renderer({
                    shuffleChoices : true
                });

                if(config){
                    //update the resolver baseUrl
                    _renderer.getAssetManager().setData({baseUrl : config.properties.baseUrl || '' });
                }
            }
            return _renderer;
        },
        getOption : function(name){
            return _renderer.getOption(name);
        },
        setOption : function(name, value){
            return _renderer.setOption(name, value);
        },
        setOptions : function(options){
            return _renderer.setOptions(options);
        },
        setContext : function($context){
            _$previousContext = $context;
            return containerHelper.setContext($context);
        },
        restoreContext : function(){
            containerHelper.setContext(_$previousContext);
             _$previousContext = null;
        },
        load : function(qtiClasses, done){
            var renderer = _renderer || this.get();
            return renderer.load(function(){
                if(_.isFunction(done)){
                    done.apply(this, arguments);
                }
            }, qtiClasses);
        }
    };

    return commonRenderer;

});
