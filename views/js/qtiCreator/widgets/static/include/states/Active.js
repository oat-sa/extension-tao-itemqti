define([
    'jquery',
    'lodash',
    'i18n',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/static/states/Active',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/static/include',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiCreator/helper/creatorRenderer',
    'taoQtiItem/qtiItem/helper/xincludeLoader',
    'ui/resourcemgr'
], function($, _, __, stateFactory, Active, formTpl, formElement, creatorRenderer, xincludeLoader){

    var IncludeStateActive = stateFactory.extend(Active, function(){

        this.initForm();

    }, function(){

        this.widget.$form.empty();
    });

    IncludeStateActive.prototype.initForm = function(){

        var _widget = this.widget,
            $original = _widget.$original,
            $form = _widget.$form,
            include = _widget.element,
            baseUrl = _widget.options.baseUrl;

        $form.html(formTpl({
            baseUrl : baseUrl || '',
            href : include.attr('href')
        }));

        //init slider and set align value before ...
        _initUpload(_widget);

        //... init standard ui widget
        formElement.initWidget($form);

        //init data change callbacks
        formElement.setChangeCallbacks($form, include, {
            href : _.throttle(function(include, value){

                console.log('@todo', 'disable the input field');

                include.attr('href', value);

            }, 100)
        });

    };

    var _initUpload = function(widget){

        var mediaSources,
            $form = widget.$form,
            options = widget.options,
            xinclude = widget.element,
            $container = widget.$container,
            $uploadTrigger = $form.find('[data-role="upload-trigger"]'),
            $href = $form.find('input[name=href]');

        if(options.mediaManager.mediaSources.length === 0){
            mediaSources = ['local'];
        }
        else{
            mediaSources = options.mediaManager.mediaSources;
        }
        var _openResourceMgr = function(){
            $uploadTrigger.resourcemgr({
                title : __('Please select an image file from the resource manager. You can add files from your computer with the button "Add file(s)".'),
                appendContainer : options.mediaManager.appendContainer,
                mediaSources : mediaSources,
                browseUrl : options.mediaManager.browseUrl,
                uploadUrl : options.mediaManager.uploadUrl,
                deleteUrl : options.mediaManager.deleteUrl,
                downloadUrl : options.mediaManager.downloadUrl,
                fileExistsUrl : options.mediaManager.fileExistsUrl,
                params : {
                    uri : options.uri,
                    lang : options.lang,
                    filters : 'image/jpeg,image/png,image/gif'
                },
                pathParam : 'path',
                select : function(e, files){

                    var file;

                    if(files && files.length){

                        file = files[0].file;
                        
                        file = 'stimulus.xml';
                            
                        xinclude.attr('href', file);

                        console.log('selected include', file);
                        console.log('fectch data and load into', xinclude);
                        console.log('rerender the xinclude', $container);
                        
                        var baseUrl = 'taoQtiItem/test/samples/qtiv2p1/associate_include/';
                        xincludeLoader.load(xinclude, baseUrl, function(xi, data, loadedClasses){
                            creatorRenderer.get().load(function(){
                                
                                xinclude.setRenderer(this);
                                xinclude.render($container);
                                debugger;
                                xinclude.postRender();
                                
                            }, loadedClasses);
                        });

                        _.defer(function(){
                            $href.val(file).trigger('change');
                        });
                    }
                },
                open : function(){
                    //hide tooltip if displayed
                    if($href.hasClass('tooltipstered')){
                        $href.blur().tooltipster('hide');
                    }
                },
                close : function(){
                    //triggers validation : 
                    $href.blur();
                }
            });
        };

        $uploadTrigger.on('click', _openResourceMgr);

        //if empty, open file manager immediately
        if(!$href.val()){
            _openResourceMgr();
        }

    };

    return IncludeStateActive;
});
