define([
    'jquery',
    'lodash',
    'i18n',
    'taoQtiItem/qtiCreator/helper/commonRenderer',
    'json!taoQtiItem/qtiCreator/editor/resources/device-list.json',
    'tpl!taoQtiItem/qtiCreator/tpl/preview/preview',
    'tpl!taoQtiItem/qtiCreator/tpl/preview/iframe',
    'taoQtiItem/qtiCreator/editor/styleEditor/styleEditor',
    'select2'
], function ($, _, __, commonRenderer, deviceList, previewTpl, iframeTpl, styleEditor) {
    'use strict'

    var overlay,
        container,
        togglersByTarget = {},
        currOrientation = 'landscape',
        currPreviewType = 'desktop',
        $doc = $(document);

    /**
     * Create data set for device selectors
     *
     * @param type
     * @returns {Array}
     * @private
     */
    var _getDeviceSelectorData = function(type) {

        /*
         * @todo
         * The device list is currently based on the devices found on the Chrome emulator.
         * This is not ideal and should be changed in the future.
         * I have http://en.wikipedia.org/wiki/List_of_displays_by_pixel_density in mind but we
         * will need to figure what criteria to apply when generating the list.
         */
        var devices = type === 'mobile' ? deviceList['tablets'] : deviceList['screens'],
            options = [];

        _.forEach(devices, function(value) {
            options.push({
                value: [value.width, value.height].join(','),
                label: value.label,
                selected: currPreviewType === value.label
            });
        });

        return options;
    };

    /**
     * Add functionality to device selectors
     *
     * @private
     */
    var _setupDeviceSelectors = function() {

        overlay.find('.preview-device-selector').on('change', function() {
            var elem = $(this),
                type = (this.className.indexOf('mobile') > -1 ? 'mobile' : 'desktop'),
                val = elem.val().split(','),
                animationSettings,
                i = val.length,
                container = $('.' + type + '-preview-container');


            while (i--) {
                val[i] = parseFloat(val[i]);
            }

            if (type === 'mobile' && currOrientation === 'portrait') {
                animationSettings = {
                    width: val[1],
                    height: val[0]
                };
            }
            else {
                animationSettings = {
                    width: val[0],
                    height: val[1]
                };
            }

            if (animationSettings.width === container.width()
                && animationSettings.height === container.height()) {
                return false;
            }

            container.animate(animationSettings, function () {
                currPreviewType = type;
            });
        }).select2({
            minimumResultsForSearch: -1
        });
    };

    /**
     * Setup orientation selector
     * @private
     */
    var _setupOrientationSelector = function() {
        $('.mobile-orientation-selector').on('change', function () {
            var newOrientation = $(this).val(),
                animationSettings,
                mobilePreviewFrame = $('.mobile-preview-frame'),
                mobilePreviewContainer = mobilePreviewFrame.find('.mobile-preview-container');

            if (newOrientation === currOrientation) {
                return false;
            }

            animationSettings = {
                height: mobilePreviewContainer.width(),
                width: mobilePreviewContainer.height()
            };

            mobilePreviewContainer.animate(animationSettings, function () {
                mobilePreviewFrame.removeClass('mobile-preview-' + currOrientation)
                    .addClass('mobile-preview-' + newOrientation);

                // reset global orientation
                currOrientation = newOrientation;
            });

        }).select2({
            minimumResultsForSearch: -1
        });
    };

    /**
     * Close preview
     *
     * @returns {*|HTMLElement}
     */
    var _setupCloser = function () {
        var closer = overlay.find('.preview-closer');
        closer.on('click', function () {
            commonRenderer.setContext($('.item-editor-item'));
            overlay.fadeOut();
        });

        $doc.keyup(function (e) {
            if (e.keyCode == 27) {
                closer.trigger('click');
            }
        });
    };

    /**
     * Toggle between mobile and desktop
     *
     * @returns {*}
     */
    var _setupTogglers = function () {

        var togglers = overlay.find('.toggle-view');

        togglers.each(function() {
            var toggler = $(this);
            togglersByTarget[toggler.data('target')] = toggler;
        });

        togglers.on('click', function () {
            var target = $(this).data('target'),
                newClass = 'preview-' + target,
                oldClass = newClass === 'preview-desktop' ? 'preview-mobile' : 'preview-desktop';

            overlay.removeClass(oldClass).addClass(newClass);
            currPreviewType = target;
        });
    };

    var _getIframeContentWindow = function(type) {
        var dfd = new jQuery.Deferred();

        var iframe = overlay.find('.' + type + '-preview-iframe');
        if(iframe.contents().length){
            dfd.resolve(iframe[0]);
        }

        iframe.on('load', function() {
            dfd.resolve(iframe[0]);
        });
        return dfd.promise();
    };


    var _setupIframes = function(item) {

        $.when(_getIframeContentWindow('mobile'), _getIframeContentWindow('desktop'))
            .then(function(mobile, desktop){

                var iframeBoilerPlate = iframeTpl(),
                    iframes = {},
                    name;

                _.forEach([mobile, desktop], function(iframe){
                    name = iframe.name.replace('-preview-iframe', '');
                    iframes[name] = $(iframe).contents()[0];
                    iframes[name].open();
                    iframes[name].write(_.clone(iframeBoilerPlate));
                    iframes[name].close();

                    iframes[name].$head = $(iframes[name].getElementsByTagName('head')[0]);
                    iframes[name].$body = $(iframes[name].body);

                    // build item
                    iframes[name].itemWrapper = $(iframes[name].getElementById('item-wrapper'));
                    iframes[name].itemWrapper.empty();

                    // item style sheets
                    commonRenderer.render(item, iframes[name].itemWrapper);
                    _.forEach(item.stylesheets, function(stylesheet){
                        iframes[name].$head.append($(stylesheet.render()));
                    });

                    // add custom styles
                    iframes[name].userStyles = $(iframes[name].getElementById('iframe-user-styles'));
                    iframes[name].userStyles.text(styleEditor.create(false));
                });
            });
    };


    /**
     * Remove possibly existing widgets and create a new one
     *
     * @param item
     * @private
     */
    var _initWidget = function(item) {
        $('.preview-overlay').remove();
        container = null;
        overlay = $(previewTpl({
            mobileDevices: _getDeviceSelectorData('mobile'),
            desktopDevices: _getDeviceSelectorData('desktop')
        }));

        $('body').append(overlay);
        _setupDeviceSelectors();
        _setupOrientationSelector();
        _setupTogglers();
        _setupCloser();
        _setupIframes(item);
    };


    /**
     * Display the preview
     *
     * @private
     */
    var _showWidget = function(launcher) {

        currPreviewType = $(launcher).data('preview-type') || 'desktop';

        if (togglersByTarget[currPreviewType]) {
            togglersByTarget[currPreviewType].trigger('click');
        }

        overlay.fadeIn(function () {
            overlay.height($doc.outerHeight());
            overlay.find('select').trigger('change');
        });
    };


    return (function ($) {

        /**
         * Create preview
         *
         * @param launchers - buttons to launch preview
         * @param item
         */
        var init = function(launchers, item){

            _initWidget(item);

            $(launchers).on('click', function() {
                _showWidget(this);
            });
        };

        return {
            init: init
        }
    }($));
});