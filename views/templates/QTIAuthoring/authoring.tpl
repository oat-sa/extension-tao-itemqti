<link rel="stylesheet" href="<?=get_data('qtiAuthoring_path')?>lib/jwysiwyg/jquery.wysiwyg.css" type="text/css" />
<link rel="stylesheet" href="<?=get_data('qtiAuthoring_path')?>lib/jwysiwyg/jquery.wysiwyg.modal.css" type="text/css" />
<link rel="stylesheet" href="<?=get_data('qtiAuthoring_path')?>lib/simplemodal/jquery.simplemodal.css" type="text/css" />
<link rel="stylesheet" href="<?=BASE_WWW?>css/qtiAuthoring.css" type="text/css" />

<!--libs required for dynamic preview-->
<link rel="stylesheet" type="text/css" href="<?=BASE_WWW?>js/qtiDefaultRenderer/lib/mediaelement/css/mediaelementplayer.min.css" media="screen" />

<div id="qtiAuthoring_loading">
    <div id="qtiAuthoring_loading_message">
        <img src="<?=ROOT_URL?>/tao/views/img/ajax-loader.gif" alt="loading" />
    </div>
</div>

<div id="qtiAuthoring_main_container">
    <div id="qtiAuthoring_title_container" class="ui-widget-content ui-corner-top" style="display:none;">
    </div>

    <div id="qtiAuthoring_menu_container" class="ui-widget-content ui-corner-top">
        <div id="qtiAuthoring_menu_left_container" class="ui-widget-header">
            <div id="qtiAuthoring_save_button" class="qti-menu-item">
                <img title="<?=__('Save')?>" src="<?=get_data('qtiAuthoring_img_path')?>document-save.png"/>
                <br/>
                <a href="#"><?=__('Save')?></a>
            </div>

            <div id="qtiAuthoring_preview_button" class="qti-menu-item">
                <img title="<?=__('Popup Preview')?>" src="<?=get_data('qtiAuthoring_img_path')?>view-fullscreen.png"/>
                <br/>
                <a href="#"><?=__('Popup Preview')?></a>
            </div>
<?if(DEBUG_MODE && true):?>
                <div id="qtiAuthoring_export_button" class="qti-menu-item">
                    <img title="<?=__('Export')?>" src="<?=ROOT_URL?>/tao/views/img/actions/export.png"/>
                    <br/>
                    <a href="#"><?=__('Export')?></a>
                </div>

                <div id="qtiAuthoring_debug_button" class="qti-menu-item">
                    <img title="<?=__('Debug')?>" src="<?=get_data('qtiAuthoring_img_path')?>bug.png"/>
                    <br/>
                    <a href="#"><?=__('Debug')?></a>
                </div>
<?endif;?>
        </div>
        <div id="qtiAuthoring_menu_right_container">
            <div id="qtiAuthoring_item_editor_button" class="qti-menu-item qti-menu-item-wide">
                <img title="<?=__('Return to item editor')?>" src="<?=get_data('qtiAuthoring_img_path')?>return.png"/>
                <br/>
                <a href="#"><?=__('Return to item editor')?></a>
            </div>

            <div id="qtiAuthoring_menu_interactions">
                <div id ="qti-carousel-prev" class="qti-carousel-button">
                    <img id="qti-carousel-prev-button" title="<?=__('Prev')?>" src="<?=get_data('qtiAuthoring_img_path')?>go-previous-view.png"/>
                </div>
                <div id ="qti-carousel-container">
                    <div id ="qti-carousel-content"></div>
                </div>
                <div id ="qti-carousel-next" class="qti-carousel-button">
                    <img id="qti-carousel-next-button" title="<?=__('Next')?>" src="<?=get_data('qtiAuthoring_img_path')?>go-next-view.png"/>
                </div>
            </div>

            <div id="qtiAuthoring_menu_interactions_overlay" class="ui-widget-overlay"></div>
        </div>
    </div>
</div>
<div id="tabs-qti">

    <ul id="tabs-qti-menu">
        <li><a href="#qtiAuthoring_item_container"></a></li>
        <li><a href="#qtiAuthoring_interaction_container"></a></li>
    </ul>

    <div id="qtiAuthoring_item_container">
        <div id="qtiAuthoring_item_left_container">
            <div id="item_option_accordion">
                <h3><a href="#"><?=__('QTI Item Attributes')?></a></h3>
                <div id="qtiAuthoring_itemProperties" class="ui-widget-content ui-corner-bottom">
<?=get_data('itemForm')?>
                </div>
                <h3><a href="#"><?=__('Response processing template editor')?></a></h3>
                <div id="qtiAuthoring_processingEditor" class="ui-widget-content ui-corner-bottom"></div>
                <h3><a href="#"><?=__('Stylesheets manager')?></a></h3>
                <div id="qtiAuthoring_cssManager" class="ui-widget-content ui-corner-bottom main-container"></div>
            </div>
        </div>

        <div id="qtiAuthoring_item_right_container">
            <div id="qtiAuthoring_itemEditor" class="ui-widget-content ui-corner-bottom">
                <textarea name="wysiwyg" id="itemEditor_wysiwyg"><?=_dh(get_data('itemData'))?></textarea>
            </div>
        </div>

        <div style="clear:both"></div>
    </div>

    <div id="qtiAuthoring_interaction_container">
    </div>

</div>



<div id="dialog-confirm" title="" style="display:none;"><span class="ui-icon ui-icon-alert"></span><p id="dialog-confirm-message"></p></div>

<script type="text/javascript">
    
    /*
     * Please do not use this as an example, it's the fastest way to load the deprecated authoring,
     * and to prevent wasting time in wrapping deprecated code in modules.
     */
    require([
        'require',
        'jquery', 
        'context', 
        'lock', 
        'i18n', 
        'generis.actions',
        'helpers',
        'jqueryui',
        'jquery.autogrow',
        'taoQTI/qtiAuthoring/shim',
        'taoQTI/qtiAuthoring/util',
        'taoQTI/qtiAuthoring/lib/jwysiwyg/jquery.wysiwyg',
        'taoQTI/qtiAuthoring/lib/jwysiwyg/jquery.wysiwyg.extended',
        'taoQTI/qtiAuthoring/lib/simplemodal/jquery.simplemodal',
        'taoQTI/qtiAuthoring/QTIauthoringException',
        'taoQTI/qtiAuthoring/class.HtmlEditor',
        'taoQTI/qtiAuthoring/tinyCarousel',
        'taoQTI/qtiAuthoring/IdentifierList',
        'taoQTI/qtiAuthoring/interactionClass',
        'taoQTI/qtiAuthoring/MathEditor',
        'taoQTI/qtiAuthoring/FeedbackEditor',
        'taoQTI/qtiAuthoring/lib/raphael',
        'taoQTI/qtiAuthoring/qtiShapeEditClass',
        'mediaElement',
        'mathJax' 
    ], 
    function(require, $, context, Lock){
       
       //use globals...
        generisActions = require('generis.actions');
        __ = require('i18n');
        helpers = require('helpers');
        
        root_url = context.root_url;
        img_url = root_url + "taoQTI/views/img/qtiAuthoring/";
        
        require(['taoQTI/qtiAuthoring/class.HtmlEditorItem'], function(){
         require(['taoQTI/qtiAuthoring/qtiEditClass'], function(){
             
            if($.browser.chrome || $.browser.webkit){
                $('#qtiAuthoring_itemProperties').height('483.6px');
                $('#qtiAuthoring_processingEditor').height('483.6px');
                $('#qtiAuthoring_cssManager').height('483.6px');
            }

            //init interface:
            $myTab = $("#tabs-qti");
            if($myTab.tabs){
                $myTab.tabs({
                    select : function(event, ui){
                        if(ui.index == 0 || ui.index == 1){
                            return true;
                        }
                        return false;
                    }
                });
            }


            $('#tabs-qti-menu').hide();
            $('#qtiAuthoring_item_editor_button').hide();

            //init item editor:
            try{

               
                    //global item object
                    qtiEdit.setFrameCSS([
                        "<?=BASE_WWW?>css/normalize.css",
                        "<?=BASE_WWW?>css/base.css",
                        "<?=BASE_WWW?>css/qtiAuthoringFrame.css"
                    ]);
                    qtiEdit.itemSerial = '<?=get_data('itemSerial')?>';
                    myItem = new qtiEdit('<?=get_data('itemSerial')?>');

                    qtiEdit.idList = new IdentifierList(<?=get_data('identifierList')?>);

                    //set item name in title bar (disabled)
                    var titleInput = $('#AssessmentItem_Form').find('input#title');
                    if(titleInput.length){
                        qtiEdit.setTitleBar($(titleInput[0]).val());
                    }

                    //prevent item form submission from other method than ajax
                    $('#AssessmentItem_Form').submit(function(){
                        return false;
                    });
                
            }catch(err){
                $.error('error creating the item' + err);
            }

            //link the qti object to the item rdf resource
            myItem.itemUri = '<?=get_data('itemUri')?>';
            myItem.itemClassUri = '<?=get_data('itemClassUri')?>';

            //set the save button:
            $('#qtiAuthoring_save_button').click(function(){
                myItem.save();
                return false;
            });

            //set the preview button:
            $('#qtiAuthoring_preview_button').click(function(){
                myItem.preview();
                return false;
            });

    <?if(DEBUG_MODE):?>
                //set debug button
                $('#qtiAuthoring_debug_button').click(function(){
                    myItem.debug();
                    return false;
                });

                $('#qtiAuthoring_export_button').click(function(){
                    myItem.exportItem();
                    return false;
                });
    <?endif;?>
                $("#item_option_accordion").accordion({
                    heightStyle : "fill",
                    fillSpace : true
                });



            myItem.loadStyleSheetForm();

            var interactionTypes = qtiEdit.availableInteractions();
            for(var interactionType in interactionTypes){
                var id = 'add_' + interactionType + '_interaction';
                var $menuItem = $('<div/>');
                $menuItem.attr('id', id);
                $menuItem.addClass('qti-menu-item');
                $menuItem.appendTo($('#qti-carousel-content'));

                var label = interactionTypes[interactionType]['short'];
                var $imgElt = $('<img/>');
                $imgElt.attr('title', label);
                $imgElt.attr('src', interactionTypes[interactionType].icon);
                $menuItem.append($imgElt);
                $menuItem.append('<br/>');
                $menuItem.append('<a href="#">' + label + '</a>');
                $imgElt.on('drag dragstart', function(e){
                    e.preventDefault();
                });
                $('#qtiAuthoring_itemEditor').find('li.' + id).hide();
                $menuItem.bind('click', {id : id}, function(e){
                    $('#qtiAuthoring_itemEditor').find('li.' + e.data.id).click();
                });
            }

            setTimeout(function(){

                $('#qtiAuthoring_loading').hide();
                $('#qtiAuthoring_main_container').show();
                var qtiInteractionCarousel = new tinyCarousel('#qti-carousel-container', '#qti-carousel-content', '#qti-carousel-next-button', '#qti-carousel-prev-button');

                //init interactions button carousel:
                $(window).unbind('resize').resize(function(){
                    qtiInteractionCarousel.update();
                });

            }, 1000);
        
         });
        });

        //Attempt to detect if we are leaving the authoring tool context to remove the lock automatically
        var linkSelector= "a";
        var autoUnlockHandler = function (e) {
        var container = $("#qtiAuthoring_main_container");
        if (!container.is(e.target) // if the target of the click isn't the container...
            && container.has(e.target).length === 0) // ... nor a descendant of the container
        {
            //release the lock
            var lock = new Lock('<?=get_data('itemUri')?>');
            lock.release(function (){}, function (){});
            $(linkSelector).unbind("click",autoUnlockHandler);
        }
        }
        $(linkSelector).click(autoUnlockHandler);
    });
</script>