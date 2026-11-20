define([
    'lodash',
    'jquery',
    'taoQtiItem/qtiCreator/model/mixin/editable',
    'taoQtiItem/qtiItem/core/Object'
], function(_, $, editable, Object){
    "use strict";
    var methods = {};
    _.extend(methods, editable);
    _.extend(methods, {
        description: function (value) {
            const wrapper = document.implementation.createDocument(null, 'fallback').documentElement;
            const root = this.getRootElement();
            if (root && root.getNamespaces) {
                _.forEach(root.getNamespaces(), function (uri, prefix) {
                    wrapper.setAttribute(prefix ? `xmlns:${prefix}` : 'xmlns', uri);
                });
            }
            const serializer = new XMLSerializer();
            const xml = serializer.serializeToString(wrapper).replace(/\/>$/, () => `>${this._alt || ''}</fallback>`);
            const doc = new DOMParser().parseFromString(xml, 'application/xml');
            if (doc.getElementsByTagName('parsererror').length) {
                throw new Error('Cannot edit alternative text: invalid object fallback XML');
            }
            const fallback = doc.documentElement;
            let description = Array.from(fallback.children).find(function (child) {
                return child.localName === 'span' && child.classList.contains('tao-multimedia-video-description');
            });
            if (typeof value === 'undefined') {
                return description ? description.textContent : '';
            }
            if (!value && !description) {
                return this;
            }
            if (value) {
                if (!description) {
                    description = doc.createElementNS(fallback.namespaceURI, 'span');
                    description.setAttribute('class', 'tao-multimedia-video-description');
                    fallback.appendChild(description);
                }
                description.textContent = value;
            } else if (description) {
                description.remove();
            }
            this._alt = Array.from(fallback.childNodes, node => serializer.serializeToString(node)).join('');
            $(document).trigger('attributeChange.qti-widget', { element: this, key: '_alt', value: this._alt });
            return this;
        },
        toArray: function () {
            const data = this._super();
            if (typeof this._alt === 'string') {
                data._alt = this._alt;
            }
            return data;
        },
        getDefaultAttributes : function(){
            return {
                data : '',
                type : ''
            };
        }
    });
    return Object.extend(methods);
});
