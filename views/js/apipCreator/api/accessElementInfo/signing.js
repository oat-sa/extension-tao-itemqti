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
define(['lodash', 'taoQtiItem/apipCreator/editor/form/signing'], function (_, Form) {
    'use strict';

    var attributes = {
        "signFileASL.videoFileInfo.fileHref" : {
            "type" : 'textNode'
        },
        "signFileASL.videoFileInfo.contentLinkIdentifier" : {
            "type" : 'attribute'
        },
        "signFileASL.videoFileInfo.mimeType" : {
            "type" : 'attribute'
        },
        "signFileASL.videoFileInfo.startCue" : {
            "type" : 'textNode'
        },
        "signFileASL.videoFileInfo.endCue" : {
            "type" : 'textNode'
        },
        "signFileASL.boneAnimationVideoFile.fileHref" : {
            "type" : 'textNode'
        },
        "signFileSignedEnglish.videoFileInfo.fileHref" : {
            "type" : 'textNode'
        },
        "signFileSignedEnglish.videoFileInfo.contentLinkIdentifier" : {
            "type" : 'attribute'
        },
        "signFileSignedEnglish.videoFileInfo.mimeType" : {
            "type" : 'attribute'
        },
        "signFileSignedEnglish.videoFileInfo.startCue" : {
            "type" : 'textNode'
        },
        "signFileSignedEnglish.videoFileInfo.endCue" : {
            "type" : 'textNode'
        },
        "signFileSignedEnglish.boneAnimationVideoFile.fileHref" : {
            "type" : 'textNode'
        }
    };

    /**
     * Get a short and descriptive view 
     * Something that can be served as a thumbnail
     * 
     * @returns {String} the rendered HTML
     */
    function getDescriptiveView(accessElementInfo) {
        return 'this is a signing access element info';
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
     * @param {object} options
     * @param {object} options.type 'signFileSignedEnglish' or 'signFileASL'. 'signFileASL' - default value.
     * @returns {object} new XML node
     */
    function createXMLNode(apipItem, options) {
        options = options || {};
        var type = options.type || 'signFileASL',
            accessElementNode = apipItem.createNode('apip', 'signing'),
            signTypeNode = apipItem.createNode('apip', type),
            videoFileInfoNode = apipItem.createNode('apip', 'videoFileInfo', {contentLinkIdentifier : ''});

        videoFileInfoNode.appendChild(apipItem.createNode('apip', 'fileHref', {contentLinkIdentifier : ''}));
        videoFileInfoNode.appendChild(apipItem.createNode('apip', 'startCue', {contentLinkIdentifier : ''}));
        videoFileInfoNode.appendChild(apipItem.createNode('apip', 'endCue', {contentLinkIdentifier : ''}));

        signTypeNode.appendChild(videoFileInfoNode);
        accessElementNode.appendChild(signTypeNode);

        return accessElementNode;
    }


    return {
        typeId : 'signing',
        label : 'signing',
        attributes : attributes,
        getDescriptiveView : getDescriptiveView,
        createXMLNode : createXMLNode,
        getFormView : getFormView
    };
});