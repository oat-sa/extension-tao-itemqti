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
 * Copyright (c) 2020 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 */

/**
 * @author Ansul Sharma <ansultaotesting.com>
 */
import template from 'taoQtiItem/reviewRenderer/tpl/interactions/uploadInteraction';
import uploadInteraction from 'taoQtiItem/qtiCommonRenderer/renderers/interactions/UploadInteraction';
import containerHelper from 'taoQtiItem/qtiCommonRenderer/helpers/container';
import __ from 'i18n';
import 'ui/previewer';
/**
 * Set the response to the rendered interaction.
 *
 * The response format follows the IMS PCI recommendation :
 * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343
 *
 * Available base types are defined in the QTI v2.1 information model:
 * http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10321
 *
 * @param {object} interaction
 * @param {object} response
 */
function setResponse(interaction, response) {
    const $container = containerHelper.get(interaction);
    const $previewArea = $container.find('.file-upload-preview');
    if (response.base && response.base.file) {
        const downloadLink = document.createElement("a");

        const { name: filename, mime, data } = response.base.file;
        const downloadUrl = data ? `data:${mime};base64,${response.base.file.data}` : '';

        $container
            .find('.file-name')
            .empty()
            .text(filename);

        $container
            .find('[data-control="download"]')
            .on('click', e => {
                e.preventDefault();
                downloadLink.href = downloadUrl;
                downloadLink.download = filename;
                downloadLink.click();
            });

        $previewArea.previewer({
            url: downloadUrl,
            name: filename,
            mime: mime
        });
    } else {
        $container
            .find('.file-upload')
            .hide();

        $previewArea.css({
            'min-width': '300px',
            'min-height': '200px'
        })
    }
    interaction.data('_response', response);
};

function render(interaction) {
    callResetGui(interaction);
    //init response
    interaction.data('_response', { base: null });
};

function callResetGui(interaction) {
    const renderer = interaction.getRenderer();
    if (_.isFunction(renderer.resetGui)) {
        renderer.resetGui(interaction);
    }
}

export default Object.assign({}, uploadInteraction, {
    template,
    setResponse,
    render
});
