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
 * Copyright (c) 2015 (original work) Open Assessment Technologies SA ;
 *
 */
define(['lodash', 'taoQtiItem/apipCreator/editor/form/spoken'], function (_, Form) {
    'use strict';

    var attributes = {
        "spokenText" : {
            "type" : 'textNode'
        },
        "spokenText.contentLinkIdentifier" : {
            "type" : 'attribute'
        },
        "textToSpeechPronunciation" : {
            "type" : 'textNode'
        },
        "textToSpeechPronunciation.contentLinkIdentifier" : {
            "type" : 'attribute'
        },
        "audioFileInfo" : {
            "type" : 'textNode',
            "creator" : function (accessElementInfo) {
                return createAttribute(accessElementInfo, 'audioFileInfo');
            }
        },
        "audioFileInfo.contentLinkIdentifier" : {
            "type" : 'attribute',
            "creator" : function (accessElementInfo) {
                return createAttribute(accessElementInfo, 'audioFileInfo');
            }
        },
        "audioFileInfo.fileHref" : {
            "type" : 'textNode',
            "creator" : function (accessElementInfo) {
                return createAttribute(accessElementInfo, 'audioFileInfo');
            }
        },
        "audioFileInfo.startTime" : {
            "type" : 'textNode',
            "creator" : function (accessElementInfo) {
                return createAttribute(accessElementInfo, 'audioFileInfo');
            }
        },
        "audioFileInfo.duration" : {
            "type" : 'textNode',
            "creator" : function (accessElementInfo) {
                return createAttribute(accessElementInfo, 'audioFileInfo');
            }
        },
        "audioFileInfo.voiceType" : {
            "type" : 'textNode',
            "creator" : createAttribute
        },
        "audioFileInfo.voiceSpeed" : {
            "type" : 'textNode',
            "creator" : createAttribute
        },
        "audioFileInfo.mimeType" : {
            "type" : 'attribute',
            "creator" : function (accessElementInfo) {
                return createAttribute(accessElementInfo, 'audioFileInfo');
            }
        }
    };

    /**
     * Create element info node.
     * @param {object} accessElementInfo 
     * @param {string} name
     * @returns {object} created XML node.
     */
    function createAttribute(accessElementInfo, name) {
        var attributeNode,
            nameWithoutIndex = name.replace(/(\w+)(\[\d+\])?(.*)/, '$1$3'),
            apipItem = accessElementInfo.apipItem;

        switch (nameWithoutIndex) {
        case 'audioFileInfo':
            attributeNode = apipItem.createNode('apip', 'audioFileInfo', {contentLinkIdentifier : ''});
            attributeNode.appendChild(apipItem.createNode('apip', 'fileHref'));
            attributeNode.appendChild(apipItem.createNode('apip', 'startTime'));
            attributeNode.appendChild(apipItem.createNode('apip', 'duration'));
            attributeNode.appendChild(apipItem.createNode('apip', 'voiceType'));
            attributeNode.appendChild(apipItem.createNode('apip', 'voiceSpeed'));
            accessElementInfo.data.appendChild(attributeNode);
            break;
        case 'audioFileInfo.voiceType':
            var parentNode = accessElementInfo.getAttributeNode(name.split('.').slice(0, -1).join('.'));
            if (!parentNode) {
                parentNode = createAttribute(name.split('.').slice(0, -1).join('.'));
            }
            parentNode.appendChild(apipItem.createNode('apip', 'voiceType'));
            break;
        case 'audioFileInfo.voiceSpeed':
            var parentNode = accessElementInfo.getAttributeNode(name.split('.').slice(0, -1).join('.'));
            if (!parentNode) {
                parentNode = createAttribute(name.split('.').slice(0, -1).join('.'));
            }
            parentNode.appendChild(apipItem.createNode('apip', 'voiceSpeed'));
            break;
        }

        return attributeNode;
    }

    /**
     * Get a short and descriptive view 
     * Something that can be served as a thumbnail
     * 
     * @param {object} accessElementInfo
     * @returns {String} the rendered HTML
     */
    function getDescriptiveView(accessElementInfo) {
        return 'this is a spoken access element info';
    }

    /**
     * Get the renderer html form for the accessElementInfo 
     * 
     * @param {Object} accessElementInfo
     * @returns {String}
     */
    function getFormView(accessElementInfo) {
        return new Form(accessElementInfo);
    }

    /**
     * Create new xml node.
     * @param {object} apipItem
     * @returns {object} new XML node
     */
    function createXMLNode(apipItem) {
        var accessElementNode = apipItem.createNode('apip', 'spoken');
        accessElementNode.appendChild(apipItem.createNode('apip', 'spokenText', {contentLinkIdentifier : ''}));
        accessElementNode.appendChild(apipItem.createNode('apip', 'textToSpeechPronunciation', {contentLinkIdentifier : ''}));
        return accessElementNode;
    }
    
    return {
        typeId : 'spoken',
        label : 'spoken',
        getDescriptiveView : getDescriptiveView,
        getFormView : getFormView,
        attributes : attributes,
        createXMLNode : createXMLNode
    };
});