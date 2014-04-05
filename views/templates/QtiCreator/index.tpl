<?php
use oat\taoQtiItem\helpers\Authoring;
?>
<!--pretty print-->
<script src="/taoQtiItem/views/js/qtiXmlRenderer/test/renderer/prism/prism.js" data-manual></script>
<script src="/taoQtiItem/views/js/qtiXmlRenderer/test/renderer/vkBeautify.js"></script>
<link rel="stylesheet" href="/taoQtiItem/views/js/qtiXmlRenderer/test/renderer/prism/prism.css">
<style>
    #new-interaction{cursor:pointer;}
    
    .widget-box:hover{border:1px solid blue;}
    
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
        <div id="item-editor-logo">
            <?=__('Item creator')?>
        </div>
        <ul class="plain clearfix item-editor-menu lft">
            <li id="save-trigger"><span class="icon-save"></span><?=__('Save')?></li>
            <li id="preview-trigger"><span class="icon-preview"></span><?=__('Preview')?></li>
            <li id="print-trigger"><span class="icon-print"></span><?=__('Print')?></li>
            <li id="download-trigger"><span class="icon-download"></span><?=__('Export')?></li>
        </ul>
        <ul class="plain clearfix item-editor-menu rgt">
            <li id="item-editor-status">&nbsp;</li>
            <li id="appearance-trigger" data-widget="<?=__('Edit Widget')?>" data-item="<?=__('Edit Item')?>"><span
                    class="icon-document"></span><span class="menu-label"><?=__('Edit Item')?></span></li>
            <li><span class="icon-settings"></span><?=__('Settings')?></li>
        </ul>
    </div>

    <div class="wrapper clearfix content" id="item-editor-wrapper">
        <!-- left sidebar -->
        <div class="item-editor-sidebar" id="item-editor-interaction-bar">

            <section class="tool-group clearfix">
                <?php foreach(Authoring::getAvailableAuthoringElements() as $group => $groupValues):
                    ?>

                    <h2><?=$group?></h2>

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
                <?php endforeach;?>
            </section>
        </div>
        <!-- /left sidebar -->

        <!-- right sidebar -->
        <div class="item-editor-sidebar" id="item-editor-item-widget-bar">
            <div class="item-editor-item-related" id="item-editor-item-bar">
                <section class="tool-group clearfix">
                    <h2><?=__('Screen width')?></h2>

                    <div class="panel">
                        <h3><?=__('Presets')?></h3>
                        <select class="panel-row" id="item-editor-device-selector"
                                data-not-selected="-- <?=__('Select a device')?> --"
                                data-selected="-- <?=__('Reset to default')?> --">
                            <option value=""></option>
                        </select>

                        <h3><?=__('Custom value')?></h3>

                        <div class="slider panel-row" id="item-editor-resizer"></div>

                    </div>

                </section>
                <section class="tool-group clearfix">
                    <h2><?=__('Text')?></h2>

                    <div class="panel">
                        <select id="item-editor-font-selector" class="font-selector" data-target="item"
                                data-not-selected="-- <?=__('Select a font')?> --"
                                data-selected="-- <?=__('Reset to default')?> --">
                            <option value=""></option>
                        </select>
                    </div>
                </section>
            </div>
            <div class="item-editor-widget-related" id="item-editor-widget-bar">

                <section class="tool-group clearfix">
                    <h2><?=__('This widget')?></h2>

                    <div class="panel">
                        <h3><?=__('List style')?></h3>
                        <select class="panel-row item-editor-list-styler">
                            <option value="none"><?=__('None')?></option>
                            <option value="circle"><?=__('Circle')?> (◦)</option>
                            <option value="disc"><?=__('Disc')?> (•)</option>
                            <option value="square"><?=__('Square')?> (▪)</option>
                            <option value="decimal"><?=__('Decimal')?> (1.)</option>
                            <option value="decimal-leading-zero"><?=__('Decimal leading zero')?> (01.)</option>
                            <option value="lower-alpha"><?=__('Lower Alpha')?> (a.)</option>
                            <option value="upper-alpha"><?=__('Upper Alpha')?> (A.)</option>
                            <option value="lower-roman"><?=__('Lower Roman')?> (i.)</option>
                            <option value="upper-roman"><?=__('Upper Roman')?> (I.)</option>
                            <option value="lower-greek"><?=__('Lower Greek')?> (α.)</option>
                            <option value="armenian"><?=__('Armenian')?> (Ա.)</option>
                            <option value="georgian"><?=__('Georgian')?> (ა.)</option>
                            <option value="hebrew"><?=__('Hebrew')?> (א.)</option>
                            <option value="hiragana"><?=__('Hiragana')?> (あ.)</option>
                            <option value="katakana"><?=__('Katakana')?> (ア.)</option>
                        </select>

                    </div>

                </section>
            </div>
            <div class="item-editor-body-element-related" id="item-editor-body-element-property-bar">
                <section class="tool-group clearfix">
                    <h2><?=__('Body Element Properties')?></h2>
                    <div class="panel"></div>
                </section>
            </div>
            <div class="item-editor-interaction-related" id="item-editor-interaction-property-bar">
                <section class="tool-group clearfix">
                    <h2><?=__('Interaction Properties')?></h2>
                    <div class="panel"></div>
                </section>
            </div>
            <div class="item-editor-choice-related" id="item-editor-choice-property-bar">
                <section class="tool-group clearfix">
                    <h2><?=__('Choice Properties')?></h2>
                    <div class="panel"></div>
                </section>
            </div>
            <div class="item-editor-response-related" id="item-editor-respons-propertye-bar">
                <section class="tool-group clearfix">
                    <h2><?=__('Response Properties')?></h2>
                    <div class="panel"></div>
                </section>
            </div>

        </div>
        <!-- /right sidebar -->

        <!-- item panel -->
        <main id="item-editor-panel" class="clearfix tao-scope">

            <div class="item-editor-item clearfix">
                <h1 class="item-title col-12">Item title</h1>

                <div class="item-editor-drop-area">


                </div>

            </div>

        </main>
        <!-- /item panel -->
    </div>
</div>
<script>
    require(['taoQtiItem/controller/creator/main'], function(controller){
        controller.start({uri : '<?=get_data('uri')?>'});
    });
</script>