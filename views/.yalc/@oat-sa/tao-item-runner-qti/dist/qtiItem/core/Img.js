define(['taoQtiItem/qtiItem/core/Element', 'lodash', 'taoQtiItem/qtiItem/helper/rendererConfig'], function (Element, _, rendererConfig) { 'use strict';

    Element = Element && Object.prototype.hasOwnProperty.call(Element, 'default') ? Element['default'] : Element;
    _ = _ && Object.prototype.hasOwnProperty.call(_, 'default') ? _['default'] : _;
    rendererConfig = rendererConfig && Object.prototype.hasOwnProperty.call(rendererConfig, 'default') ? rendererConfig['default'] : rendererConfig;

    var Img = Element.extend({
        qtiClass: 'img',
        render: function() {
            var args = rendererConfig.getOptionsFromArguments(arguments),
                renderer = args.renderer || this.getRenderer(),
                defaultData = {};

            defaultData.attributes = {
                src: renderer.resolveUrl(this.attr('src'))
            };

            return this._super(_.merge(defaultData, args.data), args.placeholder, args.subclass, renderer);
        },
        isEmpty: function() {
            return !this.attr('src');
        }
    });

    return Img;

});
