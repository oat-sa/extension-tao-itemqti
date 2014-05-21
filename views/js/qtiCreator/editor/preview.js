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
        orientation = 'landscape',
        previewType = 'desktop',
        $doc = $(document),
        screenWidth = $doc.width();

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
                selected: previewType === value.label
            });
        });

        return options;
    };

    var _center = function() {
        var previewContainer = $('.' + previewType + '-preview-frame'),
            previewWidth = previewContainer.outerWidth(),
            previewLeft = (previewWidth - screenWidth) / 2;

        if(previewWidth <= screenWidth) {
            return;
        }

        $(window).scrollLeft(previewLeft);

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
                sizeSettings,
                i = val.length,
                container = $('.' + type + '-preview-container');


            while (i--) {
                val[i] = parseFloat(val[i]);
            }

            if (type === 'mobile' && orientation === 'portrait') {
                sizeSettings = {
                    width: val[1],
                    height: val[0]
                };
            }
            else {
                sizeSettings = {
                    width: val[0],
                    height: val[1]
                };
            }

            if (sizeSettings.width === container.width()
                && sizeSettings.height === container.height()) {
                return false;
            }

            container.css(sizeSettings);
            previewType = type;
            _center();

        }).select2({
            minimumResultsForSearch: -1
        });
    };

    /**
     * Setup orientation selector. There is no actual orientation switch for desktop but it could
     * be added easily if required.
     * @private
     */
    var _setupOrientationSelectors = function() {

        $('.orientation-selector').on('change', function () {
            var type = $(this).data('target'),
                previewFrame = $('.' + type + '-preview-frame'),
                previewContainer = previewFrame.find('.' + type + '-preview-container'),
                sizeSettings,
                newOrientation = $(this).val();

                if (newOrientation === orientation) {
                    return false;
                }

                sizeSettings = {
                    height: previewContainer.width(),
                    width: previewContainer.height()
                };

                previewContainer.css(sizeSettings);
                previewFrame.removeClass(type + '-preview-' + orientation).addClass(type + '-preview-' + newOrientation);

                // reset global orientation
                orientation = newOrientation;
                // scroll to center
                _center();

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
     * @param item @todo this needs to be removed if we decide to use iframes, see further notes below
     * @returns {*}
     */
    var _setupTogglers = function (item) {

        var togglers = overlay.find('.toggle-view');

        togglers.each(function() {
            var toggler = $(this);
            togglersByTarget[toggler.data('target')] = toggler;
        });

        togglers.on('click', function () {
            var target = $(this).data('target'),
                newClass = 'preview-' + target,
                oldClass = newClass === 'preview-desktop' ? 'preview-mobile' : 'preview-desktop',
                targetContainer;

            overlay.removeClass(oldClass).addClass(newClass);
            previewType = target;

            /**
             * @todo: Workaround to provide an easy switch between <div> and <iframe> rendering
             * If we ultimately go for <iframes> the argument 'item' as well as the if-condition need to be removed
             * If we stick to <div> the if-condition should be removed since 'item' would be mandatory
             */
            if(item) {
                targetContainer =  $('.' + target + '-preview-container');
                targetContainer.empty();
                commonRenderer.render(item, targetContainer);
            }
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


    /**
     * Create and populate iframes
     *
     * @todo this whole section is questionable. If we decide to use iframes rather than divs
     * the iframe should be loaded as external resource
     *
     * @param item
     * @private
     */
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
                    iframes[name].itemWrapper = $(iframes[name].getElementById('iframe-item-container'));
                    iframes[name].itemWrapper.empty();

                    // item style sheets
                    _.forEach(item.stylesheets, function(stylesheet){
                        iframes[name].$head.append($(stylesheet.render()));
                    });
                    // @todo - this is broken but could be solved by loading external iframe rather than creating one
                    //commonRenderer.render(item, iframes[name].itemWrapper);

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
        _center();

        _setupDeviceSelectors();
        _setupOrientationSelectors();
        _setupCloser();

        // @todo make decision between <iframe> and <div> rendering and remove irrelevant code below
        // <div> version, see also comments in _setupTogglers()
        _setupTogglers(item);

        // <iframe> version, note the missing argument for _setupTogglers(), see also comments there
        /*
        _setupTogglers();
        _setupIframes(item);
        */
    };


    /**
     * Display the preview
     *
     * @private
     */
    var _showWidget = function(launcher) {

        previewType = $(launcher).data('preview-type') || 'desktop';

        if (togglersByTarget[previewType]) {
            togglersByTarget[previewType].trigger('click');
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