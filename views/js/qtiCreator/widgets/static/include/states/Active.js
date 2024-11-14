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
 * Copyright (c) 2014-2017 (original work) Open Assessment Technlogies SA
 *
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/static/states/Active',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/static/include',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiCreator/helper/xincludeRenderer',
    'taoQtiItem/qtiCreator/widgets/static/helpers/itemScrollingMethods',
    'ui/resourcemgr',
    'ui/tooltip'
], function ($, _, __, stateFactory, Active, formTpl, formElement, xincludeRenderer, itemScrollingMethods) {
    'use strict';

    const wrapperCls = 'custom-include-box';

    const IncludeStateActive = stateFactory.extend(
        Active,
        function () {
            this.initForm();
        },
        function () {
            this.widget.$form.empty();
        }
    );

    const changeCallbacks = function (widget) {
        return {
            scrolling: function (element, value) {
                itemScrollingMethods.wrapContent(widget, value, 'outer');
            },
            scrollingHeight: function (element, value) {
                itemScrollingMethods.setScrollingHeight(widget.$container.parent(`.${wrapperCls}`), value);
            }
        };
    };

    const _initUpload = function (widget) {
        const $form = widget.$form,
            options = widget.options,
            $uploadTrigger = $form.find('[data-role="upload-trigger"]'),
            $href = $form.find('input[name=href]');

        const _openResourceMgr = function () {
            $uploadTrigger.resourcemgr({
                title: __('Please select a shared stimulus file from the resource manager.'),
                appendContainer: options.mediaManager.appendContainer,
                mediaSourcesUrl: `${options.mediaManager.mediaSourcesUrl}?exclude=local`,
                browseUrl: options.mediaManager.browseUrl,
                uploadUrl: options.mediaManager.uploadUrl,
                deleteUrl: options.mediaManager.deleteUrl,
                downloadUrl: options.mediaManager.downloadUrl,
                fileExistsUrl: options.mediaManager.fileExistsUrl,
                disableUpload: true,
                params: {
                    uri: options.uri,
                    lang: options.lang,
                    filters: 'application/qti+xml'
                },
                pathParam: 'path',
                select: function (e, files) {
                    let file;

                    if (files && files.length) {
                        file = files[0].file;
                        $href.val(file);

                        //set the selected file as the new href and refresh rendering
                        xincludeRenderer.render(widget, options.baseUrl, file);

                        _.defer(function () {
                            $href.trigger('change');
                        });
                    }
                },
                open: function () {
                    //hide tooltip if displayed
                    if ($href.data('$tooltip')) {
                        $href.blur().data('$tooltip').hide();
                    }
                },
                close: function () {
                    //triggers validation :
                    $href.blur();
                }
            });
            const $mgr = $(options.mediaManager.appendContainer);
            $mgr.on('fileselect.resourcemgr', function (e, file) {
                if (/taomedia:\/\/mediamanager\//.test(file.file)) {
                    // rich passage XML will be loaded in iframe
                    const iframe = $mgr.find('.previewer iframe');
                    iframe.off('load').on('load', function () {
                        // parent div should be wrapped in div.qti-item as in item preview
                        iframe.contents().find('body > div').wrap('<div class="qti-item"></div>');
                        // table should have qti-table class as in item preview
                        iframe.contents().find('table').addClass('qti-table');
                        // for figure and figcaption should be removed namespace
                        iframe.contents().find('qh5\\:figcaption').each(function () {
                            const $figcaption = $(this);
                            $figcaption.replaceWith(`<figcaption>${$figcaption.html()}</figcaption>`);
                        });
                        iframe.contents().find('qh5\\:figure').each(function () {
                            const $figure = $(this);
                            const $img = $figure.find('img');
                            if ($img.length) {
                                const width = $img.attr('width');
                                $img.attr('width', '100%');
                                $figure.replaceWith(`<figure style="width:${width}" class="${$figure.attr("class")}">${$figure.html()}</figure>`);
                            } else {
                                $figure.replaceWith(`<figure>${$figure.html()}</figure>`);
                            }
                        });
                        // default styles for test runner as in item preview
                        const $head = iframe.contents().find('head');
                        const styleTao = $('<link>', {
                            rel: 'stylesheet',
                            type: 'text/css',
                            href: '/tao/views/css/tao-main-style.css'
                        });
                        const styleTaoQtiItem = $('<link>', {
                            rel: 'stylesheet',
                            type: 'text/css',
                            href: '/taoQtiItem/views/css/qti-runner.css'
                        });
                        $head.append(styleTao);
                        $head.append(styleTaoQtiItem);
                        _.forEach(xincludeRenderer.getXincludeHandlers(), handler => handler(file.file, '', '', $head, true));
                    });
                }
            });
        };

        $uploadTrigger.on('click', _openResourceMgr);
        $href.on('click', _openResourceMgr); //href input is read only

        //if empty, open file manager immediately
        if (!$href.val()) {
            _openResourceMgr();
        }
    };



    IncludeStateActive.prototype.initForm = function () {
        const _widget = this.widget,
            $form = _widget.$form,
            include = _widget.element,
            baseUrl = _widget.options.baseUrl,
            $wrap = _widget.$container.parent(`.${wrapperCls}`),
            isScrolling = itemScrollingMethods.isScrolling($wrap),
            selectedHeight = itemScrollingMethods.selectedHeight($wrap);

        $form.html(
            formTpl({
                baseUrl: baseUrl || '',
                href: include.attr('href'),
                scrolling: isScrolling,
                scrollingHeights: itemScrollingMethods.options(),
                selectedHeight: selectedHeight
            })
        );

        _initUpload(_widget);

        formElement.initWidget($form);

        formElement.setChangeCallbacks($form, _widget.element, changeCallbacks(_widget));

        itemScrollingMethods.initSelect($form, isScrolling, selectedHeight);
    };

    return IncludeStateActive;
});
