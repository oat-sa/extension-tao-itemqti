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
 * Copyright (c) 2016-2024 (original work) Open Assessment Technologies SA;
 */
define([
    'jquery',
    'lodash',
    'module',
    'i18n',
    'ui/feedback',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/blockInteraction/states/Question',
    'taoQtiItem/qtiCreator/editor/ckEditor/htmlEditor',
    'taoQtiItem/qtiCreator/editor/gridEditor/content',
    'taoQtiItem/qtiCreator/widgets/helpers/content',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiCreator/widgets/component/minMax/minMax',
    'taoQtiItem/qtiCreator/widgets/helpers/selectionWrapper',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/interactions/hottext',
    'tpl!taoQtiItem/qtiCreator/tpl/toolbars/htmlEditorTrigger',
    'tpl!taoQtiItem/qtiCreator/tpl/toolbars/hottext-create',
    'tpl!taoQtiItem/qtiCreator/tpl/toolbars/hottext-create-multiple'
], function (
    $,
    _,
    module,
    __,
    feedback,
    stateFactory,
    Question,
    htmlEditor,
    gridContentHelper,
    htmlContentHelper,
    formElement,
    minMaxComponentFactory,
    selectionWrapper,
    formTpl,
    toolbarTpl,
    newHottextBtnTpl,
    newHottextMultipleBtnTpl
) {
    'use strict';

    const config = module.config(); // flag config.disallowHTMLInHottext - only pure text is allowed for hottext
    const allowedInlineStaticElts = ['math']; // support for more inline static elements (img...) can be added here
    const HottextInteractionStateQuestion = stateFactory.extend(
        Question,
        function () {
            this.buildEditor();
        },
        function () {
            this.destroyEditor();
        }
    );

    HottextInteractionStateQuestion.prototype.buildEditor = function buildEditor() {
        const _widget = this.widget,
            container = _widget.element.getBody(),
            $container = _widget.$container,
            $editableContainer = $container.find('.qti-flow-container');
        let $bodyTlb;

        $editableContainer.attr('data-html-editable-container', true);

        if (!htmlEditor.hasEditor($editableContainer)) {
            $bodyTlb = $(
                toolbarTpl({
                    serial: _widget.serial,
                    state: 'question'
                })
            );

            //add toolbar once only:
            $editableContainer.append($bodyTlb);
            $bodyTlb.show();

            //init hot text creator
            this.initHottextCreator();

            //create editor
            htmlEditor.buildEditor($editableContainer, {
                shieldInnerContent: false,
                change: gridContentHelper.getChangeCallbackForBlockStatic(container),
                data: {
                    container: container,
                    widget: _widget
                },
                qtiInclude: false,
                flushDeletingWidgetsOnDestroy: true
            });
        }
    };

    HottextInteractionStateQuestion.prototype.destroyEditor = function destroyEditor() {
        const $container = this.widget.$container,
            $flowContainer = $container.find('.qti-flow-container'),
            $editable = $container.find('.qti-flow-container [data-html-editable]');

        $editable.off('hottextcreator');

        //search and destroy the editor
        htmlEditor.destroyEditor($flowContainer);

        //remove toolbar
        $flowContainer.find('.mini-tlb[data-role=cke-launcher-tlb]').remove();
    };

    HottextInteractionStateQuestion.prototype.validateAndCreateHottext =
        async function validateAndCreateHottext({
            wrapper,
            clone: $newHottextClone,
            content: $cloneContent,
            range,
        }) {
            if ($cloneContent.find("p").length) {
                feedback().error(
                    __("Cannot create hottext from this selection. Please make sure the selection does not contain multiple lines.")
                );
                return;
            }
            if (!config.disallowHTMLInHottext) {
                if (wrapper.wrapHTMLWith($newHottextClone, range)) {
                    await this.createNewHottext($newHottextClone);
                } else {
                    feedback().error(__("Cannot create hottext from this selection."));
                }
            } else {
                if (
                    $cloneContent.text() === $cloneContent.html() &&
                    wrapper.wrapWith($newHottextClone, range)
                ) {
                    await this.createNewHottext($newHottextClone);
                } else {
                    feedback().error(
                        __("Cannot create hottext from this selection. Please make sure the selection does not contain both formatted and unformatted words.")
                    );
                }
            }
        };

    HottextInteractionStateQuestion.prototype.initForm = function initForm() {
        const widget = this.widget;
        const $form = widget.$form;
        const interaction = widget.element;
        let callbacks;

        $form.html(formTpl());

        //controls min and max choices
        minMaxComponentFactory($form.find('.min-max-panel'), {
            min: { value: _.parseInt(interaction.attr('minChoices')) || 0 },
            max: { value: _.parseInt(interaction.attr('maxChoices')) || 0 },
            upperThreshold: _.size(interaction.getChoices())
        }).on('render', function () {
            widget.on('choiceCreated choiceDeleted', data => {
                if (data.interaction.serial === interaction.serial) {
                    this.updateThresholds(1, _.size(interaction.getChoices()));
                }
            });
        });

        formElement.initWidget($form);

        callbacks = formElement.getMinMaxAttributeCallbacks('minChoices', 'maxChoices');
        formElement.setChangeCallbacks($form, interaction, callbacks);
    };

    /**
     * Add the button that allow to create hottext when a selection is made
     */
    HottextInteractionStateQuestion.prototype.initHottextCreator = function initHottextCreator() {
        const interactionWidget = this.widget,
            $editable = interactionWidget.$container.find('.qti-flow-container [data-html-editable]'),
            $flowContainer = interactionWidget.$container.find('.qti-flow-container'),
            $toolbar = $flowContainer.find('.mini-tlb[data-role=cke-launcher-tlb]'),
            $newHottextBtn = $(newHottextBtnTpl()),
            $newHottextMultipleBtn = $(newHottextMultipleBtnTpl()),
            $newHottext = $('<span>', {
                class: 'widget-box',
                'data-new': true,
                'data-qti-class': 'hottext'
            }),
            wrapper = selectionWrapper({
                $container: $editable,
                allowQtiElements: false,
                whiteListQtiClasses: !config.disallowHTMLInHottext ? allowedInlineStaticElts : []
            });

        $toolbar.append($newHottextMultipleBtn);
        $toolbar.append($newHottextBtn);
        $newHottextBtn.hide();
        $newHottextMultipleBtn.hide();

        $editable
            .on('mouseup.hottextcreator', function () {
                if (wrapper.canWrap()) {
                    $newHottextBtn.show();
                    if (wrapper.isMultipleSelection()) {
                        $newHottextMultipleBtn.show();
                    }
                } else {
                    $newHottextBtn.hide();
                    $newHottextMultipleBtn.hide();
                }
            })
            .on('blur.hottextcreator', function () {
                $newHottextBtn.hide();
                $newHottextMultipleBtn.hide();
            });

        $newHottextBtn.on('mousedown.hottextcreator', async () => {
            $newHottextBtn.hide();
            const $newHottextClone = $newHottext.clone();
            const $cloneContent = wrapper.getCloneOfContents();
            await this.validateAndCreateHottext({
                wrapper,
                clone: $newHottextClone,
                content: $cloneContent,
            });
        });

        $newHottextMultipleBtn.on('mousedown.hottextcreator', async () => {
            $newHottextMultipleBtn.hide();
            const cloneContentBatch = wrapper.getCloneOfContentsInBatch();
            for (const content of cloneContentBatch) {
                const { node: $cloneContent, range } = content;
                const $newHottextClone = $newHottext.clone();
                await this.validateAndCreateHottext({
                  wrapper,
                  clone: $newHottextClone,
                  content: $cloneContent,
                  range,
                });
            }
        });
    };

    /**
     * Create a new hottext
     * @param {JQueryElement} $hottextContent - content of the hottext. May contain plain text and html if not disallowed by flag disallowHTMLInHottext
     */
    HottextInteractionStateQuestion.prototype.createNewHottext = async function createNewHottext($hottextContent) {
        const interactionWidget = this.widget,
            interaction = interactionWidget.element,
            $editable = interactionWidget.$container.find('.qti-flow-container [data-html-editable]');

        let $inlineStaticWidgets, newHottextElt, newHottextBody;
        let resolveCreateNewHottext;
        const onceCreatingFinished = new Promise(resolve => {
            resolveCreateNewHottext = resolve;
        });

        htmlContentHelper.createElements(
            interaction.getBody(),
            $editable,
            htmlEditor.getData($editable),
            function (newHottextWidget) {
                newHottextElt = newHottextWidget.element;

                // look for nested inlineStatic elements
                $inlineStaticWidgets = $hottextContent.find(
                    allowedInlineStaticElts
                        .map(function (qtiClass) {
                            return `.widget-${qtiClass}`;
                        })
                        .join(',')
                );

                // update elements hierarchy
                if ($inlineStaticWidgets && $inlineStaticWidgets.length > 0) {
                    $inlineStaticWidgets.each(function () {
                        const serial = $(this).data('serial'),
                            elt = interaction.getElement(serial),
                            eltWidget = elt.data('widget');

                        // move element from interaction to hottext element
                        interaction.removeElement(elt);
                        newHottextElt.setElement(elt);

                        // destroy the widget and replace it with a placeholder that will be used for rendering
                        $(this).replaceWith(elt.placeholder());
                        eltWidget.destroy();
                    });
                }
                if (!config.disallowHTMLInHottext) {
                    newHottextBody = $hottextContent.html();
                } else {
                    // strip everything that hasn't been replaced and that is not pure text
                    newHottextBody = _.escape($hottextContent.text());
                }

                if (newHottextBody.trim() !== '') {
                    // update model and render it inline
                    newHottextElt.body(newHottextBody);
                    newHottextElt.render(newHottextElt.getContainer());
                    newHottextElt.postRender();

                    // recreate editing widget
                    newHottextWidget.destroy();
                    newHottextWidget = newHottextElt.data('widget');
                    newHottextWidget.changeState('choice');

                    // trigger create event
                    $(document).trigger('choiceCreated.qti-widget', {interaction});
                }
                resolveCreateNewHottext();
            }
        );
        return onceCreatingFinished;
    };

    return HottextInteractionStateQuestion;
});
