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
define([], function(){

    /**
     * Get a short and descriptive view 
     * Something that can be served as a thumbnail
     * 
     * @returns {String} the rendered HTML
     */
    function getDescriptiveView(accessElementInfo){
        return 'this is a spoken access element info';
    }

    /**
     * Get the renderer html form for the accessElementInfo 
     * 
     * @param {Object} accessElementInfo
     * @returns {String}
     */
    function getFormView(accessElementInfo){
        return '<form></form>';
    }

    /**
     * Set the attribute value for the spoken access element
     * 
     * Allowed values are: 
     * - spokenText
     * - testToSpeechPronunciation
     * - audioFileInfo.fileHref
     * - audioFileInfo.startTime
     * - audioFileInfo.duration
     * - audioFileInfo.voiceType
     * - audioFileInfo.voiceSpeed
     * 
     * Note : audioFileInfo.fileHref and the other audioFileInfo.* will target the first audioFileInfo node found, if none exists, create one
     * 
     * @param {Object} accessElementInfo
     * @param {String} name
     * @param {Mixed} value
     * @returns {Mixed}
     */
    function setAttribute(accessElementInfo, name, value){
        return accessElementInfo;
    }
    
    /**
     * Get the attribute value for the spoken access element
     * 
     * Allowed values are: 
     * - spokenText
     * - testToSpeechPronunciation
     * - audioFileInfo.fileHref
     * - audioFileInfo.startTime
     * - audioFileInfo.duration
     * - audioFileInfo.voiceType
     * - audioFileInfo.voiceSpeed
     * 
     * Note : audioFileInfo.fileHref and the other audioFileInfo.* will target the first audioFileInfo node found
     * 
     * @param {Object} accessElementInfo
     * @param {String} name
     * @param {Mixed} value
     * @returns {Mixed}
     */
    function getAttribute(accessElementInfo, name, value){
        return null;
    }

    return {
        typeId : 'spoken',
        label : 'spoken',
        getDescriptiveView : getDescriptiveView,
        getFormView : getFormView
    };
});
