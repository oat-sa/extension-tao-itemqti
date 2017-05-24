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
    'i18n'
], function (_, __) {
    "use strict";

    var uploadMime = {
        /**
         * @TODO these mime types are not up-to-date, in particular the MS ones
         * refer to http://filext.com/faq/office_mime_types.php
         * @type [{getMimeTypes: getMimeTypes}]
         */
        getMimeTypes : function getMimeTypes() {
            return [
                {"mime": "application/zip", "label": __("ZIP archive"), equivalent:["application/x-zip-compressed"]},
                {"mime": "text/plain", "label": __("Plain text")},
                {"mime": "application/pdf", "label": __("PDF file")},
                {"mime": "image/jpeg", "label": __("JPEG image")},
                {"mime": "image/png", "label": __("PNG image")},
                {"mime": "image/gif", "label": __("GIF image")},
                {"mime": "image/svg+xml", "label": __("SVG image")},
                {"mime": "audio/mpeg", "label": __("MPEG audio"), equivalent:["audio/mp3"]},
                {"mime": "audio/x-ms-wma", "label": __("Windows Media audio")},
                {"mime": "audio/x-wav", "label": __("WAV audio"), equivalent:["audio/wav"]},
                {"mime": "video/mpeg", "label": __("MPEG video")},
                {"mime": "video/mp4", "label": __("MP4 video")},
                {"mime": "video/quicktime", "label": __("Quicktime video")},
                {"mime": "video/x-ms-wmv", "label": __("Windows Media video")},
                {"mime": "video/x-flv", "label": __("Flash video")},
                {"mime": "text/csv", "label": __("CSV file")},
                {"mime": "application/msword", "label": __("Microsoft Word"), equivalent:["application/vnd.openxmlformats-officedocument.wordprocessingml.document"]},
                {"mime": "application/vnd.ms-excel", "label": __("Microsoft Excel"), equivalent:["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"]},
                {"mime": "application/vnd.ms-powerpoint", "label": __("Microsoft Powerpoint"), equivalent:["application/vnd.openxmlformats-officedocument.presentationml.presentation"]}
            ];
        },

        /**
         * Set the expected types in the format according to the number of types
         *
         * @param {Object} interaction
         * @param {Array} types
         */
        setExpectedTypes : function setExpectedTypes(interaction, types) {
            var classes = interaction.attr('class') || '';
            classes = classes.replace(/x-tao-upload-type-[-_a-zA-Z+.0-9]*/g, '').trim();
            interaction.attr('class', classes);
            interaction.removeAttr('type');

            if (!types) {
                return;
            }

            if (types.length === 1) {
                //if there is only one value set into the qti standard type attribute
                if (types[0] !== 'any/kind') {
                    interaction.attr('type', types[0]);
                }
            } else {
                //if there is more than one value, set into into TAO specific css classes
                //qti 2.1 xsd indeed does not allow comma-separated multi mime type value for the attribute "type
                interaction.attr('class', _.reduce(types, function (acc, selectedType) {
                    return acc + ' x-tao-upload-type-' + selectedType.replace('/', '_');
                }, classes).trim());
            }
        },

        /**
         * Return the array of authorized mime types
         * It first get the standard "type" attribute value.
         * If not set search the TAO specific type information recorded in the class attributes,
         * qti 2.1 xsd indeed does not allow comma-separated multi mime type value for the attribute "type"
         * @param {Object} interaction - standard QTI interaction model object
         * @param {Boolean} [includeEquivalents] - enable including all recognized as equivalent types
         * @returns {Array}
         */
        getExpectedTypes : function getExpectedTypes(interaction, includeEquivalents) {
            var classes = interaction.attr('class') || '';
            var types = [];
            var mimes;
            var equivalents = [];
            if (interaction.attr('type')) {
                types.push(interaction.attr('type'));
            } else {
                classes.replace(/x-tao-upload-type-([-_a-zA-Z+.0-9]*)/g, function ($0, type) {
                    types.push(type.replace('_', '/').trim());
                });
            }

            // add in equivalent mimetypes to the list of expected types
            if(includeEquivalents === true){
                mimes = uploadMime.getMimeTypes();
                _.forEach(types, function(mime){
                    var mimeData = _.find(mimes, {mime:mime});
                    if(mimeData && _.isArray(mimeData.equivalent)){
                        equivalents = _.union(equivalents, mimeData.equivalent);
                    }
                });
            }

            return _.union(types, equivalents);
        }
    };

    return uploadMime;
});
