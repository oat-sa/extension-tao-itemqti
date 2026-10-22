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
 * Copyright (c) 2015-21 (original work) Open Assessment Technologies SA ;
 */
import _ from 'lodash';
import __ from 'i18n';
import mimeTypes from 'core/mimetype/definitions';

const delimetr = ' ';

const uploadMime = {
    /**
     * Fetch mime type definitions
     * (translation function for labels must be injected from here)
     * @returns {Array}
     */
    getMimeTypes: function getMimeTypes() {
        return mimeTypes.getList(__);
    },

    /**
     * Set the expected types in the format according to the number of types
     *
     * @param {Object} interaction
     * @param {Array} types
     */
    setExpectedTypes: function setExpectedTypes(interaction, types) {
        let classes = interaction.attr('class') || '';
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
            //For backward compatibility:
            //if there is more than one value, set into into TAO specific css classes
            interaction.attr(
                'class',
                _.reduce(
                    types,
                    function (acc, selectedType) {
                        return acc + ' x-tao-upload-type-' + selectedType.replace('/', '_');
                    },
                    classes
                ).trim()
            );

            interaction.attr('type', types.join(delimetr));
        }
    },

    /**
     * Return the array of authorized mime types
     * Get the standard "type" attribute value with mime types separated by space.
     * @param {Object} interaction - standard QTI interaction model object
     * @param {Boolean} [includeEquivalents] - enable including all recognized as equivalent types
     * @returns {Array}
     */
    getExpectedTypes: function getExpectedTypes(interaction, includeEquivalents) {
        let equivalents = [];
        let types = [];
        let mimes;

        if (interaction.attr('type')) {
            types = interaction.attr('type').split(delimetr);
        }

        // add in equivalent mimetypes to the list of expected types
        if (includeEquivalents === true) {
            mimes = uploadMime.getMimeTypes();
            _.forEach(types, function (mime) {
                const mimeData = _.find(mimes, { mime: mime });
                if (mimeData && _.isArray(mimeData.equivalent)) {
                    equivalents = _.union(equivalents, mimeData.equivalent);
                }
            });
        }

        return _.union(types, equivalents);
    }
};

export default uploadMime;
