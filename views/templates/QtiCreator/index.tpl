<?php
use oat\taoQtiItem\helpers\qti\ItemAuthoring;
?>
<link href="<?=BASE_WWW?>css/item-creator.css" rel="stylesheet">
<div id="item-editor-scope" class="tao-scope">
    <div id="item-editor-toolbar">
        <div id="item-editor-logo">
            <?=__('Item creator')?>
        </div>
        <ul class="plain clearfix item-editor-menu lft">
            <li><span class="icon-save"></span><?=__('Save')?></li>
            <li id="preview-trigger"><span class="icon-preview"></span><?=__('Preview')?></li>
            <li id="print-trigger"><span class="icon-print"></span><?=__('Print')?></li>
            <li><span class="icon-download"></span><?=__('Export')?></li>
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
                <?php foreach(ItemAuthoring::getAvailableAuthoringElements() as $group =>
                $groupValues): ?>

                <h2><?= $group ?></h2>

                <div class="panel">
                    <ul class="tool-list plain">
                        <?php foreach($groupValues as $record): ?>

                        <li title="<?=$record['title']?>" data-qti-class="<?=$record['qtiClass']?>">
                            <span class="icon-<?=$record['icon']?>"></span>

                            <div class="truncate"><?=$record['short']?></div>
                            <img class="viewport-hidden"
                                 src="<?=BASE_WWW?>img/qtiScreenshots/<?=$record['icon']?>.png"/>
                        </li>
                        <?php endforeach; ?>

                    </ul>
                </div>
                <?php endforeach; ?>
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
            <div class="item-editor-interaction-related" id="item-editor-interaction-bar">
                <section class="tool-group clearfix">
                    <h2><?=__('Interaction Properties')?></h2>
                    <div class="panel"></div>
                </section>
            </div>
            <div class="item-editor-choice-related" id="item-editor-choice-bar">
                <section class="tool-group clearfix">
                    <h2><?=__('Choice Properties')?></h2>
                    <div class="panel"></div>
                </section>
            </div>
            <div class="item-editor-response-related" id="item-editor-response-bar">
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
    require(['taoQtiItem/controller/creator/main'], function (controller) {
        controller.start({uri:'<?=get_data('uri')?>'});
    })
</script>