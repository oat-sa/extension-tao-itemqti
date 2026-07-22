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
 * Copyright (c) 2014-2017 (original work) Open Assessment Technologies SA;
 *
 */
define([
    'lodash',
    'jquery',
    'core/promise',
    'taoQtiItem/qtiItem/core/Loader',
    'taoQtiItem/qtiCreator/model/Container',
    'taoQtiItem/qtiCreator/model/Item',
    'taoQtiItem/qtiCreator/model/helper/event',
    'taoQtiItem/qtiCreator/model/qtiClasses',
    'taoQtiItem/qtiCreator/helper/commonRenderer',
    'taoQtiItem/qtiCreator/helper/xmlRenderer',
    'taoQtiItem/qtiItem/helper/simpleParser',
    'taoQtiItem/qtiCreator/helper/creatorRenderer',
    'taoQtiItem/qtiCreator/helper/xincludeRenderer',
    'taoQtiItem/qtiCreator/editor/gridEditor/content',
    'taoQtiItem/qtiCreator/editor/ckEditor/htmlEditor',
    'taoQtiItem/qtiCreator/editor/gridEditor/content',
    'lib/dompurify/purify'
], function(_, $, Promise, Loader, Container, Item, event, allQtiClasses, commonRenderer, xmlRenderer, simpleParser, creatorRenderer, xincludeRenderer, content, htmlEditor, contentHelper, DOMPurify){
    "use strict";

    var _ns = 'containereditor';

    var _defaults = {
        change : _.noop,
        markup : '',
        markupSelector : '',
        qtiMedia : false
    };

    var qtiClasses = ['img', 'object', 'math', 'include', 'printedVariable', '_container', '_tooltip', 'figure', 'figcaption', 'table'];

    event.initElementToWidgetListeners();

    function parser($container){

        //detect math ns :
        var mathNs = 'm';//for 'http://www.w3.org/1998/Math/MathML'

        //parse qti xml content to build a data object
        var data = simpleParser.parse($container.clone(), {
            ns : {
                math : mathNs
            }
        });

        if(data.body){
            return data.body;
        }else{
            throw new Error('invalid content for qti container');
        }
    }

    /**
     * Transform the given dom element into a rich-text editor
     *
     * @param {JQuery} $container - the container of the DOM element that is going to editable
     * @param {Object} [options]
     * @param {String} [options.markup] - the markup to be use as the initial editor content
     * @param {String} [options.markupSelector] - the element in $xontainer that holds the html to be used as the initial editor content
     * @param {Object} [options.related] - define the qti element object this editor is attached too. Very important to edit a picture or math element inside it because prevents leaving the editing state of the related element.
     * @param {Function} [options.change] - the callback called when the editor content has been modified
     * @param {String} [options.placeholder] - the placeholder text of the container editor when
     * @param {Array} [options.toolbar] - the ck toolbar
     * @param {Boolean} [options.qtiMedia=false] - allow insert media object
     * @param {Boolean?} [options.qtiInclude] - allow insert Include object
     * @param {Boolean?} [options.mathJax]
     * @param {Boolean?} [options.qtiImage] - allow insert image object
     * @param {Object} [options.areaBroker] - allow to set a custom areaBroker on the renderer
     * @param {String} [options.removePlugins] - a coma-separated plugin list that should not be loaded
     * @param {Object} [options.metadata] - some metadata to attach to the root element (ex: { myDataName: 'myDataValue' })
     * @param {Boolean} [options.resetRenderer] - force resetting the renderer
     * @param {Boolean} [options.autofocus] - automatically focus the editor
     * @param {Boolean?} [options.flushDeletingWidgetsOnDestroy] - before editor destroy, remove widgets which are waiting for delete confirmation
     * @returns {undefined}
     */
    function create($container, options){

        var html, htmls, data, loader;

        options = _.defaults(options || {}, _defaults);

        //assign proper markup
        if(options.markup){
            html = options.markup;
            if(options.markupSelector){
                htmls = extractHtmlFromMarkup(html, options.markupSelector);
                html = htmls[0] || '';
            }
            $container.html(html);
        }

        data = parser($container);
        loader = new Loader().setClassesLocation(allQtiClasses);
        loader.loadRequiredClasses(data, function(){

            var item,
                containerEditors,
                renderer;

            //create a new container object
            var container = new Container();

            //tag the new container as statelss, which means that its state is not supposed to change
            container.data('stateless', true);

            $container.data('container', container);

            //need to attach a container to the item to enable innserElement.remove()
            //@todo fix this
            item = new Item().setElement(container);
            container.setRootElement(item);

            if (options.metadata) {
                _.forEach(options.metadata, function (value, name) {
                    item.data(name, value);
                });
            }

            //associate it to the interaction?
            if(options.related){
                containerEditors = options.related.data('container-editors') || [];
                containerEditors.push(container);
                options.related.data('container-editors', containerEditors);
            }

            this.loadContainer(container, data);

            //apply common renderer :
            renderer = creatorRenderer.get(options.resetRenderer, {}, options.areaBroker);
            renderer.load(function(){

                var baseUrl = this.getOption('baseUrl');
                container.setRenderer(this);
                $container.html(container.render());
                container.postRender();

                //resolve xinclude
                _.forEach(container.getComposingElements(), function(element){
                    if(element.qtiClass === 'include'){
                        xincludeRenderer.render(element.data('widget'), baseUrl);
                    }
                });

                buildContainer($container);
                buildEditor($container, container, {
                    placeholder : options.placeholder || undefined,
                    toolbar : options.toolbar || undefined,
                    highlight : options.highlight,
                    removePlugins : options.removePlugins || '',
                    areaBroker : options.areaBroker,
                    autofocus: options.autofocus || false,
                    flushDeletingWidgetsOnDestroy: options.flushDeletingWidgetsOnDestroy,
                    qtiMedia: options.qtiMedia,
                    qtiInclude: options.qtiInclude,
                    mathJax: options.mathJax,
                    qtiImage: options.qtiImage

                });

                $container
                    .off('.' + _ns)
                    .on(event.getList(_ns + event.getNs() + event.getNsModel()).join(' '), _.throttle(function(){
                        var editorContent = container.render(xmlRenderer.get());
                        $container.trigger('containerchange.' + _ns, [editorContent]);

                        if(_.isFunction(options.change)){
                            options.change(editorContent);
                        }
                    }, 600));

                $container.trigger('editorready.containereditor');

            }, qtiClasses);

        });

    }

    function buildContainer($container) {

        $container.wrapInner($('<div>', {'class' : 'container-editor', 'data-html-editable' : true}));
    }

    function cleanup($container) {
        const container = $container.data('container');

        return new Promise(function (resolve) {
            if (container) {
                $(document).off('.' + container.serial);
                commonRenderer.load(qtiClasses, function(){
                    // update container editor body with sanitized value to prevent xss
                    const newBody = contentHelper.getContent($container.find('.container-editor'));
                    if (newBody) {
                        container.body(DOMPurify.sanitize(newBody));
                    }
                    $container.html(container.render(this));
                    resolve();
                });

                $container.removeData('container');
            } else {
                resolve();
            }
        });
    }

    /**
     * create a false widget that is required in html editor
     *
     * @param {JQuery} $editableContainer
     * @param {Object} container
     * @param {Object} options
     * @param {Object} options.areaBroker
     * @returns {Object} The fake widget object
     */
    function createFakeWidget($editableContainer, container, options){

        var widget = {
            $container : $editableContainer,
            element : container,
            changeState : _.noop,
            getAreaBroker : function getAreaBroker() {
                return options.areaBroker;
            }
        };
        //associate the widget to the container
        container.data('widget', widget);

        return widget;
    }

    function buildEditor($editableContainer, container, options){

        $editableContainer.attr('data-html-editable-container', true);

        if(!htmlEditor.hasEditor($editableContainer)){

            htmlEditor.buildEditor($editableContainer, _.defaults(options || {}, {
                shieldInnerContent : false,
                passthroughInnerContent : false,
                change : content.getChangeCallback(container),
                data : {
                    widget : createFakeWidget($editableContainer, container, options),
                    container : container
                }
            }));
        }
    }

    function destroy($editableContainer){
        return htmlEditor.destroyEditor($editableContainer)
            .then(function() {
                $editableContainer.removeAttr('data-html-editable-container');
                return cleanup($editableContainer);
            });
    }

    function extractHtmlFromMarkup(markupStr, selector){
        var $found = $('<div>').html(markupStr).find(selector);
        var ret = [];
        $found.each(function(){
            ret.push($(this).html());
        });
        return ret;
    }

    return {
        create : create,
        destroy : destroy
    };
});
