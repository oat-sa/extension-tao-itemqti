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
 * Copyright (c) 2024 (original work) Open Assessment Technologies SA ;
 */

/**
 * This plugin adds an item viewer aside from the item being edited.
 */
define([
    'jquery',
    'i18n',
    'services/translation',
    'core/plugin',
    'ui/hider',
    'interact',
    'taoItems/previewer/factory',
    'taoQtiItem/qtiCreator/helper/commonRenderer',
    'tpl!taoQtiItem/qtiCreator/tpl/layout/viewerPanel'
], function (
    $,
    __,
    translationService,
    pluginFactory,
    hider,
    interact,
    previewerFactory,
    qtiCommonRenderer,
    viewerPanelTpl
) {
    'use strict';

    const sideBySideAuthoringClass = 'side-by-side-authoring';

    /**
     * Returns the configured plugin
     * @returns {Function} the plugin
     */
    return pluginFactory({
        name: 'itemViewer',

        /**
         * Initialize the plugin (called during itemCreator's init)
         */
        init() {
            this.$element = $(viewerPanelTpl());
            this.hide();

            const itemCreator = this.getHost();
            const config = itemCreator.getConfig();

            if (!config.properties || !config.properties.translation) {
                return;
            }

            const { uri: resourceUri, originResourceUri } = config.properties;

            return translationService
                .getTranslations(originResourceUri, translation => translation.resourceUri === resourceUri)
                .then(data => {
                    const language = data && translationService.getTranslationsLanguage(data.resources)[0];
                    let translation = data && translationService.getTranslationsProgress(data.resources)[0];
                    if (!translation || translation == 'pending') {
                        translation = 'translating';
                    }
                    config.properties.translationStatus = translation;
                    if (language) {
                        config.properties.translationLanguageUri = language.value;
                        config.properties.translationLanguageCode = language.literal;
                    }
                })
                .catch(error => itemCreator.trigger('error', error));
        },

        /**
         * Called during the itemCreator's render phase
         */
        render() {
            const itemCreator = this.getHost();
            const config = itemCreator.getConfig();

            if (!config.properties || !config.properties.translation) {
                return;
            }

            const { uri: resourceUri, originResourceUri } = config.properties;

            const $editorArea = this.getAreaBroker().getEditorWrapperArea();
            const $container = this.$element.closest('.item-viewer-panel');
            const $title = this.$element.find('.item-viewer-bar h1');
            const $viewerContainer = this.$element.find('.item-viewer');
            const $separator = this.$element.find('.item-viewer-separator-handle');

            const restoreCreatorContext = () => {
                qtiCommonRenderer.setContext(this.getAreaBroker().getContentCreatorPanelArea());
            };

            $editorArea.prepend(this.$element);

            this.handleSeparator = interact($separator[0]).draggable({
                onmove(event) {
                    const editorWidth = $editorArea.outerWidth();
                    const currentWidth = parseFloat($container.css('width'));
                    const newWidth = currentWidth + event.dx;
                    const percentWidth = Math.round((newWidth / editorWidth) * 10000) / 100;
                    $container.css('width', `${percentWidth}%`);
                }
            });

            translationService
                .getTranslatable(originResourceUri)
                .then(data => (data && data.resources[0]) || {})
                .then(translatable => {
                    $title.text(__('%s - Original', translatable.resourceLabel));
                })
                .catch(error => itemCreator.trigger('error', error));

            previewerFactory(
                'qtiItem',
                originResourceUri,
                {},
                {
                    container: $viewerContainer,
                    disableDefaultPlugins: true,
                    view: 'viewer',
                    readOnly: true, // set to read-only as we need to restore the context and keeping access to the viewed item might introduce issues
                    fullPage: false,
                    pluginsOptions: {}
                }
            ).then(viewer => {
                viewer.on('ready', () => {
                    const preventAutoPlay = () => {
                        $viewerContainer.find('audio, video').each((i, media) => {
                            media.pause();
                        });
                        // Force to restore the context after rendering the item.
                        // This is needed as the editor needs to access the context of the item being edited.
                        // Otherwise, the editor might not work properly.
                        restoreCreatorContext();
                    };
                    viewer.getRunner().on('renderitem', preventAutoPlay);
                    preventAutoPlay();
                });
            });

            itemCreator.on('save', () => {
                const item = itemCreator.getItem();
                const itemWidget = item.data('widget');
                const progress = itemWidget && itemWidget.options && itemWidget.options.translationStatus;
                const progressUri = translationService.translationProgress[progress];

                if (progressUri) {
                    return translationService.updateTranslation(resourceUri, progressUri);
                }
            });

            this.show();
        },

        /**
         * Called during the itemCreator's destroy phase
         */
        destroy() {
            this.handleSeparator.unset();
            this.$element.remove();
        },

        /**
         * Enable the button
         */
        enable() {
            this.$element.removeProp('disabled').removeClass('disabled');
        },

        /**
         * Disable the button
         */
        disable() {
            this.$element.prop('disabled', true).addClass('disabled');
        },

        /**
         * Show the button
         */
        show() {
            this.getAreaBroker().getContainer().addClass(sideBySideAuthoringClass);
            hider.show(this.$element);
        },

        /**
         * Hide the button
         */
        hide() {
            this.getAreaBroker().getContainer().removeClass(sideBySideAuthoringClass);
            hider.hide(this.$element);
        }
    });
});
