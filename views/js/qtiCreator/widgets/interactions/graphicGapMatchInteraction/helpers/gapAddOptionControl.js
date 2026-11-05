/**
 * Source-bay "add gap choice" control: flyout to add gapImg (resource manager) or gapText.
 */
define([
    'jquery',
    'tpl!taoQtiItem/qtiCreator/tpl/toolbars/graphicGapMatch.adder',
    'taoQtiItem/qtiCreator/widgets/interactions/helpers/resourceManager'
], function ($, graphicGapMatchAdderTpl, resourceManager) {
    'use strict';

    /**
     * @param {Object} config
     * @param {Object} config.widget
     * @param {Object} config.interaction
     * @param {Object} config.gapImgSelectorOptions
     * @param {Function} config.setUpGapImg
     * @param {Function} config.onBeforeAddGapText
     * @param {Function} config.setUpGapText
     */
    function installGapAddOption(config) {
        const widget = config.widget;
        const interaction = config.interaction;
        const $gapList = $('ul.source', widget.$original);
        const $flyoutHost = $gapList.closest('.image-editor.solid');
        const $positionHost = $flyoutHost.length ? $flyoutHost : widget.$container;
        const $addOption =
            $('<li class="empty add-option" aria-haspopup="menu" aria-expanded="false">' +
                '<div><span class="icon-add"></span></div>' +
                '</li>');
        const $menuFlyout = $(
            '<div class="graphic-gap-add-options-flyout" aria-hidden="true">' + graphicGapMatchAdderTpl() + '</div>'
        );

        widget.$container.find('.graphic-gap-add-options-flyout').remove();
        widget.$container.off('click.gapAddOption');

        function positionGapAddMenu() {
            const $trigger = $gapList.find('li.add-option.empty').first();

            if (!$trigger.length || !$positionHost.length) {
                return;
            }

            const triggerRect = $trigger[0].getBoundingClientRect();
            const hostRect = $positionHost[0].getBoundingClientRect();
            const gapRaw = window
                .getComputedStyle($menuFlyout[0])
                .getPropertyValue('--ggm-add-menu-trigger-gap')
                .trim();
            const gapParsed = parseFloat(gapRaw);
            const gapAboveTrigger = Number.isFinite(gapParsed) ? gapParsed : 8;
            const flyoutWidth = $menuFlyout.outerWidth() || 144;
            const flyoutHeight = $menuFlyout.outerHeight() || 80;
            const hostScrollTop = $positionHost.scrollTop();
            const hostScrollLeft = $positionHost.scrollLeft();
            const triggerTop = triggerRect.top - hostRect.top + hostScrollTop;
            const triggerLeft = triggerRect.left - hostRect.left + hostScrollLeft;
            const topAboveTrigger = triggerTop - flyoutHeight - gapAboveTrigger;
            const topBelowTrigger = triggerTop + triggerRect.height + gapAboveTrigger;
            const minTop = hostScrollTop;
            const maxTop = hostScrollTop + Math.max($positionHost.innerHeight() - flyoutHeight, 0);
            const minLeft = hostScrollLeft;
            const maxLeft = hostScrollLeft + Math.max($positionHost.innerWidth() - flyoutWidth, 0);
            let top = topAboveTrigger;

            if (top < minTop && topBelowTrigger <= maxTop) {
                top = topBelowTrigger;
            }

            top = Math.min(Math.max(top, minTop), maxTop);

            const centeredLeft = triggerLeft + triggerRect.width / 2 - flyoutWidth / 2;
            const left = Math.min(Math.max(centeredLeft, minLeft), maxLeft);

            $menuFlyout.css({
                top,
                left,
                right: '',
                bottom: ''
            });
        }

        function hideGapAddMenu() {
            $menuFlyout.removeClass('is-visible').attr('aria-hidden', 'true');
            $addOption.attr('aria-expanded', 'false');
            $gapList.removeClass('graphic-gap-add-menu-open');
            $gapList.off('scroll.gapAddMenu');
            $(document).off('click.graphicGapAddOption');
        }

        function showGapAddMenu() {
            const savedScrollLeft = $gapList.scrollLeft();

            $gapList.addClass('graphic-gap-add-menu-open');
            $gapList.scrollLeft(savedScrollLeft);
            $menuFlyout.addClass('is-visible').attr('aria-hidden', 'false');
            positionGapAddMenu();
            window.requestAnimationFrame(function () {
                $gapList.scrollLeft(savedScrollLeft);
                positionGapAddMenu();
            });
            $gapList.on('scroll.gapAddMenu', positionGapAddMenu);
            $addOption.attr('aria-expanded', 'true');

            setTimeout(function () {
                $(document).on('click.graphicGapAddOption', function (e) {
                    if ($(e.target).closest('.graphic-gap-add-options-flyout', widget.$container).length) {
                        return;
                    }
                    if ($(e.target).closest('ul.source > li.add-option.empty', widget.$container).length) {
                        return;
                    }
                    hideGapAddMenu();
                });
            }, 0);
        }

        widget.$container.on('click.gapAddOption', 'ul.source > li.add-option.empty', function (e) {
            e.preventDefault();
            e.stopPropagation();

            if ($menuFlyout.hasClass('is-visible')) {
                hideGapAddMenu();
            } else {
                showGapAddMenu();
            }
        });

        widget.$container.on(
            'click.gapAddOption',
            '.graphic-gap-add-options-flyout [data-role=add-gap-img]',
            function (e) {
                e.preventDefault();
                e.stopPropagation();
                hideGapAddMenu();

                const $addBtn = $gapList.find('li.add-option.empty');
                const gapImgObj = interaction.createGapImg({});

                gapImgObj.object.removeAttr('type');

                $addBtn.off('selected.upload').on('selected.upload', function (ev, args) {
                    $addBtn.off('selected.upload');

                    const size = args.size;
                    let height;
                    let width;

                    if (size) {
                        height = args.size.height;
                        width = args.size.width;
                    }

                    gapImgObj.object.attr('data', args.selected.file);
                    gapImgObj.object.attr('type', args.selected.mime);
                    gapImgObj.object.attr('width', width);
                    gapImgObj.object.attr('height', height);
                    config.setUpGapImg(gapImgObj);
                });
                resourceManager($addBtn, config.gapImgSelectorOptions);
            }
        );

        widget.$container.on(
            'click.gapAddOption',
            '.graphic-gap-add-options-flyout [data-role=add-gap-text]',
            function (e) {
                e.preventDefault();
                e.stopPropagation();
                hideGapAddMenu();
                config.onBeforeAddGapText();
                config.setUpGapText(interaction.createGapText(), { autoFocus: true });
            }
        );

        $(window).on('resize.graphicGapAddOption', positionGapAddMenu);

        $positionHost.append($menuFlyout);
        $addOption.appendTo($gapList);
    }

    /**
     * @param {Object} widget
     */
    function teardownGapAddOption(widget) {
        $(document).off('click.graphicGapAddOption');
        widget.$container.off('click.gapAddOption');
        $('.graphic-gap-add-options-flyout', widget.$container).remove();
        $('ul.source', widget.$original).removeClass('graphic-gap-add-menu-open');
        $(window).off('resize.graphicGapAddOption');
    }

    return {
        install: installGapAddOption,
        teardown: teardownGapAddOption
    };
});
