<?php
use oat\taoQtiItem\helpers\Authoring;
?>
<!--pretty print-->
<script src="/taoQtiItem/views/js/qtiXmlRenderer/test/renderer/prism/prism.js" data-manual></script>
<script src="/taoQtiItem/views/js/qtiXmlRenderer/test/renderer/vkBeautify.js"></script>
<link rel="stylesheet" href="/taoQtiItem/views/js/qtiXmlRenderer/test/renderer/prism/prism.css">
<style>

    /* style to be integrated */

    /* style to be checked */
    .qti-droppable-ready{outline: 1px solid green;}
    .qti-droppable-active{outline: 1px solid yellow;}
    .qti-droppable{outline: 0px dotted green;}
    .qti-droppable-highlight{display: inline-block;width:0.3em; height:0.9em; padding: 0px; outline:2px dotted #ccc; background-color: #eee;}
    /*too jumpy*/.qti-droppable-hover{display: inline-block;width:5em; height:0.9em; padding: 0px; outline:2px dotted #ccc; background-color: #eee;}
    .qti-droppable-hover{display: inline-block;width:0.5em; height:0.9em; padding: 0px; outline:2px solid green; background-color: lightgreen;}

    .qti-droppable-block-highlight{height:1em; width:100%;outline:2px dotted #ccc; background-color: #efefef;margin:0;}
    .qti-droppable-block-hover{min-height: 30px; width:100%;border: 2px dashed #3e7da7; background-color: #e6eef4;margin:0;opacity:0.5;}

    .qti-droppable-inline-hover{display: inline-block;width:0.5em; height:0.9em; padding: 0px; border:2px dotted #3e7da7; background-color: #e6eef4;}

    .qti-authoring-element-box{position:relative;}

    .qti-element-focus{outline:1px solid black;z-index:900;}
    .qti-element-hover{outline:1px solid blue;}
    .qti-element-hover-label{position:absolute;left:0;top:-20px;outline:blue solid 1px;background-color: white;}

    .qti-position-cursor{outline: 1px solid black;}

    .qti-overlay{position:absolute; top:0; left:0; background-color:#ccc; opacity:0.35;}

    .qti-authoring-shielded{position: relative; display: inline-block;outline: 1px dashed rgba(0, 0, 0, 0.6);}
    .qti-authoring-element-button{position: absolute; z-index: 2; top: 0; left: 0; width:100%; height:100%; background: #ccc; opacity:0.5; border:none; cursor: pointer;}


    [class^="col-"], [class*=" col-"]{position: relative;outline:0px dashed blue;}

    /*[class*=" col-"]:first-child, [class^="col-"]:first-child{margin-left: 1.42857%;}*/

    .grid-edit-resizing{cursor:col-resize;}
    .grid-edit-resizable-zone{position : absolute; cursor:col-resize; text-align : center; outline: 0px dotted blue}
    .grid-edit-resizable-handle{position : relative; display:inline-block; width : 1px; height:100%;}
    .grid-edit-resizable-zone-active:hover .grid-edit-resizable-handle{border-width:0 1px;border-color: #ccc; border-style: solid;}
    .grid-edit-resizable-active{width:0;border:0px dashed #3e7da7;border-left-width: 1px;}
    .grid-edit-resizable-outline{position:absolute; top:0; left:0;height:100%;border:1px solid #3e7da7;background-color:#e4ecef;opacity:0.5;z-index:9;}

    .grid-edit-insert-box{position : absolute; height:100%; text-align : center; opacity:0.5; z-index:9;}
    .grid-edit-insert-box:hover{opacity:0.3;}
    .grid-edit-insert-square{position : relative; width: 20px; height: 20px; background-color:#3e7da7; border-top-left-radius: 3px; border-top-right-radius: 3px;}
    .grid-edit-insert-triangle{position : relative; width: 0; height: 0; border-left: 10px solid transparent; border-right: 10px solid transparent; border-top: 12px solid #3e7da7;}
    .grid-edit-insert-line{position:absolute; top:0; left:10px; height:100%; border-left:1px dashed #3e7da7}

    .grid-draggable-helper{z-index: 99; max-height: 200px; max-width:50%;overflow:hidden;border:1px solid #ddd;padding:6px;}
    .grid-draggable-helper:after{content:'...';position:absolute; bottom:0px;right:6px;}

    .grid-draggable{cursor:pointer;}
    .grid-draggable:hover{opacity:0.8;}
    .grid-draggable:active, .grid-draggable-active{cursor:all-scroll;}

    .debug [class^="col-"], .debug [class*=" col-"] {border: 0px dotted gray;position: relative;background-color:#efefef;}
</style>
<link href="<?=BASE_WWW?>css/qti.css" rel="stylesheet">
<link href="<?=BASE_WWW?>css/item-creator.css" rel="stylesheet">
<div id="item-editor-scope" class="tao-scope">
    <div id="item-editor-toolbar">
        <div id="item-editor-toolbar-inner">
            <div id="item-editor-logo">
                <?=__('Item creator')?>
            </div>
            <ul class="plain clearfix item-editor-menu lft">
                <li id="save-trigger"><span class="icon-save"></span><?=__('Save')?></li>

                <li class="preview-trigger"><span class="icon-preview"></span><?=__('Preview')?></li>
                <!-- toggle comments above below to enable/disable device specific previews -->
                <!--
                <li class="preview-trigger" data-preview-type="desktop"><span class="icon-desktop-preview"></span><?=__('Desktop preview')?></li>
                <li class="preview-trigger" data-preview-type="mobile"><span class="icon-mobile-preview"></span><?=__('Mobile preview')?></li>
                -->

                <li id="print-trigger"><span class="icon-print"></span><?=__('Print')?></li>
                <!--<li id="download-trigger"><span class="icon-download"></span><?=__('Export')?></li>-->
            </ul>
            <ul class="plain clearfix item-editor-menu rgt">
                <li id="item-editor-status">&nbsp;</li>
                <li id="appearance-trigger" data-widget="<?=__('Edit Widget')?>" data-item="<?=__('Edit Item')?>">
                    <span class="icon-edit"></span><span class="menu-label"><?=__('Appearance')?></span>
                </li>
            </ul>
        </div>
    </div>

    <div class="wrapper clearfix content" id="item-editor-wrapper">
        <!-- left sidebar -->
        <form class="item-editor-sidebar" id="item-editor-interaction-bar" autocomplete="off">

            <?php foreach(Authoring::getAvailableAuthoringElements() as $group => $groupValues): ?>

                <section class="tool-group clearfix" id="sidebar-left-section-<?=Authoring::normalizeAuthoringElementKey($group)?>">
                    <h2><?=__($group)?></h2>
                    <div class="panel">
                        <ul class="tool-list plain">
                            <?php foreach($groupValues as $record):?>

                                <li title="<?=$record['title']?>" data-qti-class="<?=$record['qtiClass']?>">
                                    <span class="icon-<?=$record['icon']?>"></span>

                                    <div class="truncate"><?=$record['short']?></div>
                                    <img class="viewport-hidden"
                                         src="<?=BASE_WWW?>img/qtiScreenshots/<?=$record['icon']?>.png"/>
                                </li>
                            <?php endforeach;?>

                        </ul>
                    </div>
                </section>

            <?php endforeach;?>
        </form>
        <!-- /left sidebar -->

        <!-- right sidebar -->
        <div class="item-editor-sidebar" id="item-editor-item-widget-bar">
            <div class="item-editor-item-related" id="item-style-editor-bar">
                <section class="tool-group clearfix" id="sidebar-right-css-manager">

                    <h2><?=__('Style Sheet Manager')?></h2>
                    <div class="panel">

                        <ul class="none" id="style-sheet-toggler">
                            <!-- TAO style sheet -->
                            <li data-css-res="taoQtiItem/views/css/qti.css">
                                <span class="icon-preview style-sheet-toggler" title="<?=__('Disable this style sheet temporarily')?>"></span>
                                <span><?=__('TAO default styles')?></span>
                            </li>

                        </ul>
                        <button id="stylesheet-uploader" class="btn-info small block"><?=__('Upload your own CSS')?></button>
                    </div>
                </section>

                <section class="tool-group clearfix" id="sidebar-right-style-editor">

                    <h2><?=__('Style Editor')?></h2>

                    <div class="panel color-picker-panel">
                        <div id="item-editor-color-picker" class="sidebar-popup-container-box">
                            <div id="color-picker-container" class="sidebar-popup">
                                <h3 id="color-picker-title"></h3>
                                <div class="color-picker"></div>
                                <input id="color-picker-input" type="text" value="#000000">

                                <a class="closer" href="#" data-close="#color-picker-container"></a>
                            </div>
                            <div class="reset-group">
                                <div class="clearfix">
                                    <label for="initial-bg"><?=__('Background color')?></label>
                                    <span class="icon-eraser reset-button" data-value="background-color" title="<?=__('Remove custom background color')?>"></span>
                                    <span class="color-trigger" id="initial-bg" data-value="background-color" data-target=".tao-scope div.qti-item"></span>
                                </div>
                                <div class="clearfix">
                                    <label for="initial-color"><?=__('Text color')?></label>
                                    <span class="icon-eraser reset-button" data-value="color" title="<?=__('Remove custom text color')?>"></span>
                                    <span class="color-trigger" id="initial-color" data-value="color" data-target=".tao-scope div.qti-item"></span>
                                </div>
                                <div class="clearfix">
                                    <label for="initial-color"><?=__('Border color')?></label>
                                    <span class="icon-eraser reset-button" data-value="color" title="<?=__('Remove custom border color')?>"></span>
                                    <span class="color-trigger" id="initial-color" data-value="border-color" data-target=".tao-scope div.qti-item .solid,.tao-scope div.qti-item .matrix, .tao-scope div.qti-item table.matrix th, .tao-scope div.qti-item table.matrix td"></span>
                                </div>
                                <div class="clearfix">
                                    <label for="initial-color"><?=__('Table headings')?></label>
                                    <span class="icon-eraser reset-button" data-value="color" title="<?=__('Remove custom background color')?>"></span>
                                    <span class="color-trigger" id="initial-color" data-value="background-color" data-target=".tao-scope div.qti-item .matrix th"></span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <hr>
                    <div class="panel">

                        <div><?=__('Font family')?></div>

                        <div class="reset-group">
                            <select data-target=".tao-scope div.qti-item" id="item-editor-font-selector" data-has-search="false" data-placeholder="<?=__('Default')?>"
                                    class="select2" data-role="font-selector"></select>
                            <span class="icon-eraser reset-button" data-role="font-selector-reset" title="<?=__('Remove custom font family')?>"></span>
                        </div>

                    </div>
                    <div class="panel">
                        <div><?=__('Font size')?></div>
                        <div class="reset-group">
                            <span id="item-editor-font-size-changer" data-target=".tao-scope div.qti-item">
                                <a href="#" data-action="reduce" title="<?=__('Reduce font size')?>" class="icon-smaller"></a>
                                <a href="#" data-action="enlarge" title="<?=__('Enlarge font size')?>" class="icon-larger"></a>
                            </span>

                            <span id="item-editor-font-size-manual-input" class="item-editor-unit-input-box">
                                <input type="text" id="item-editor-font-size-text" placeholder="<?=__('e.g. 13')?>">
                                <span class="unit-indicator">px</span>
                            </span>
                            <span class="icon-eraser reset-button" data-role="font-size-reset" title="<?=__('Remove custom font size')?>"></span>
                        </div>

                    </div>
                    <hr>
                    <div class="panel">
                        <h3><?=__('Item width')?></h3>
                        <span class="icon-help tooltipstered" data-tooltip-theme="info" data-tooltip="~ .tooltip-content:first"></span>
                        <div class="tooltip-content">
                            <?=__('Change the width of the item. By default the item has a width of 100% and adapts to the size of any screen. The maximal width is by default 1024px - this will also change when you set a custom with.')?>
                        </div>
                        <div id="item-editor-item-resizer" data-target=".tao-scope div.qti-item">
                            <label class="smaller-prompt">
                                <input type="radio" name="item-width-prompt" checked value="no-slider">
                                <span class="icon-radio"></span>
                                <?=__('Adapt to screen size')?>
                            </label>
                            <label class="smaller-prompt">
                                <input type="radio" name="item-width-prompt" value="slider">
                                <span class="icon-radio"></span>
                                <?=__('Defined width')?>
                            </label>
                            <div class="reset-group slider-box">
                                <p id="item-editor-item-resizer-slider"></p>
                                <span id="item-editor-item-resizer-manual-input" class="item-editor-unit-input-box">
                                    <input type="text" id="item-editor-item-resizer-text" placeholder="<?=__('e.g. 960')?>">
                                    <span class="unit-indicator">px</span>
                                </span>
                                <span class="icon-eraser reset-button" data-role="item-width-reset" title="<?=__('Remove custom item width')?>"></span>
                            </div>
                        </div>

                    </div>

                </section>

            </div>
            <div class="item-editor-item-related" id="item-editor-item-property-bar">
                <section class="tool-group clearfix" id="sidebar-right-item-properties">
                    <h2><?=__('Item Properties')?></h2>
                    <div class="panel"></div>
                </section>
            </div>
            <div class="item-editor-body-element-related" id="item-editor-body-element-property-bar">
                <section class="tool-group clearfix" id="sidebar-right-body-element-properties">
                    <h2><?=__('Body Element Properties')?></h2>
                    <div class="panel"></div>
                </section>
            </div>
            <div class="item-editor-item-related" id="item-editor-text-property-bar">
                <section class="tool-group clearfix" id="sidebar-right-text-block-properties">
                    <h2><?=__('Text Block Properties')?></h2>
                    <div class="panel"></div>
                </section>
            </div>
            <div class="item-editor-interaction-related" id="item-editor-interaction-property-bar">
                <section class="tool-group clearfix" id="sidebar-right-interaction-properties">
                    <h2><?=__('Interaction Properties')?></h2>
                    <div class="panel"></div>
                </section>
            </div>
            <div class="item-editor-choice-related" id="item-editor-choice-property-bar">
                <section class="tool-group clearfix" id="sidebar-right-choice-properties">
                    <h2><?=__('Choice Properties')?></h2>
                    <div class="panel"></div>
                </section>
            </div>
            <div class="item-editor-response-related" id="item-editor-response-property-bar">
                <section class="tool-group clearfix" id="sidebar-right-response-properties">
                    <h2><?=__('Response Properties')?></h2>
                    <div class="panel"></div>
                </section>
            </div>

        </div>
        <!-- /right sidebar -->

        <!-- item panel -->
        <main id="item-editor-panel" class="clearfix tao-scope"></main>
        <!-- /item panel -->
    </div>
    <div id="modalFeedbacks"></div>
</div>

<script>
    require(['taoQtiItem/controller/creator/main'], function(controller){
        controller.start({
            uri : '<?=get_data('uri')?>',
            lang : '<?=get_data('lang')?>',
            baseUrl : '<?=get_data('baseUrl')?>'
        });
    });
</script>
