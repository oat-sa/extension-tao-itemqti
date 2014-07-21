<?php
use oat\taoQtiItem\helpers\Authoring;
?>
<!--pretty print-->
<script src="/taoQtiItem/views/js/qtiXmlRenderer/test/renderer/prism/prism.js" data-manual></script>
<script src="/taoQtiItem/views/js/qtiXmlRenderer/test/renderer/vkBeautify.js"></script>
<link rel="stylesheet" href="/taoQtiItem/views/js/qtiXmlRenderer/test/renderer/prism/prism.css">

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
            <li class="preview-trigger"><span class="icon-preview"></span><?=__('Quick Preview')?></li>
            <li id="print-trigger"><span class="icon-print"></span><?=__('Print')?></li>
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

    <section class="tool-group" id="sidebar-left-section-<?=Authoring::normalizeAuthoringElementKey($group)?>">
        <h2><?=__($group)?></h2>

        <div class="panel clearfix">
            <ul class="tool-list plain">
                <?php foreach($groupValues as $record):?>

                <li
                    data-sub-group="<?=$record['sub-group']?>"
                    data-qti-class="<?=$record['qtiClass']?>"

                <? if(!empty($record['disabled'])): /* tmp fix */ ?>
                class="disabled"
                title="element available in the final release"
                <?else:?>
                title="<?=$record['title']?>"
                <? endif; ?>>

                <span class="icon-<?=$record['icon']?>"></span>

                <div class="truncate"><?=$record['short']?></div>
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
    <div class="item-editor-item-related sidebar-right-section-box" id="item-style-editor-bar">
        <section class="tool-group clearfix" id="sidebar-right-css-manager">

            <h2><?=__('Style Sheet Manager')?></h2>

            <div class="panel">

                <ul class="none" id="style-sheet-toggler">
                    <!-- TAO style sheet -->
                    <li data-css-res="taoQtiItem/views/css/qti.css">
                        <span class="icon-preview style-sheet-toggler"
                              title="<?=__('Disable this stylesheet temporarily')?>"></span>
                        <span><?=__('TAO default styles')?></span>
                    </li>

                </ul>
                <button id="stylesheet-uploader" class="btn-info small block"><?=__('Add Style Sheet')?></button>
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
                            <span class="icon-eraser reset-button" data-value="background-color"
                                  title="<?=__('Remove custom background color')?>"></span>
                            <span class="color-trigger" id="initial-bg" data-value="background-color"
                                  data-target="body div.qti-item.tao-scope"></span>
                        </div>
                        <div class="clearfix">
                            <label for="initial-color"><?=__('Text color')?></label>
                            <span class="icon-eraser reset-button" data-value="color"
                                  title="<?=__('Remove custom text color')?>"></span>
                            <span class="color-trigger" id="initial-color" data-value="color"
                                  data-target="body div.qti-item.tao-scope"></span>
                        </div>
                        <div class="clearfix">
                            <label for="initial-color"><?=__('Border color')?></label>
                            <span class="icon-eraser reset-button" data-value="color"
                                  title="<?=__('Remove custom border color')?>"></span>
                            <span class="color-trigger" id="initial-color" data-value="border-color"
                                  data-target="body div.qti-item.tao-scope .solid,body div.qti-item.tao-scope .matrix, body div.qti-item.tao-scope table.matrix th, body div.qti-item.tao-scope table.matrix td"></span>
                        </div>
                        <div class="clearfix">
                            <label for="initial-color"><?=__('Table headings')?></label>
                            <span class="icon-eraser reset-button" data-value="color"
                                  title="<?=__('Remove custom background color')?>"></span>
                            <span class="color-trigger" id="initial-color" data-value="background-color"
                                  data-target="body div.qti-item.tao-scope .matrix th"></span>
                        </div>
                    </div>
                </div>
            </div>
            <hr>
            <div class="panel">

                <div><?=__('Font family')?></div>

                <div class="reset-group">
                    <select
                        data-target="body div.qti-item.tao-scope"
                        id="item-editor-font-selector"
                        data-has-search="false"
                        data-placeholder="<?=__('Default')?>"
                        class="select2 has-icon"
                        data-role="font-selector"></select>
                    <span class="icon-eraser reset-button" data-role="font-selector-reset"
                          title="<?=__('Remove custom font family')?>"></span>
                </div>

            </div>
            <div class="panel">
                <div><?=__('Font size')?></div>
                <div class="reset-group">
                            <span id="item-editor-font-size-changer" data-target="body div.qti-item.tao-scope">
                                <a href="#" data-action="reduce" title="<?=__('Reduce font size')?>"
                                   class="icon-smaller"></a>
                                <a href="#" data-action="enlarge" title="<?=__('Enlarge font size')?>"
                                   class="icon-larger"></a>
                            </span>

                            <span id="item-editor-font-size-manual-input" class="item-editor-unit-input-box">
                                <input type="text" id="item-editor-font-size-text" class="has-icon"
                                       placeholder="<?=__('e.g. 13')?>">
                                    <span class="unit-indicator">px</span>
                            </span>
                    <span class="icon-eraser reset-button" data-role="font-size-reset"
                          title="<?=__('Remove custom font size')?>"></span>
                </div>

            </div>
            <hr>
            <div class="panel">
                <h3><?=__('Item width')?></h3>
                <span class="icon-help tooltipstered" data-tooltip-theme="info"
                      data-tooltip="~ .tooltip-content:first"></span>

                <div class="tooltip-content">
                    <?=__('Change the width of the item. By default the item has a width of 100% and adapts to the size of any screen. The maximal width is by default 1024px - this will also change when you set a custom with.')?>
                </div>
                <div id="item-editor-item-resizer" data-target="body div.qti-item.tao-scope">
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
                                    <input type="text" id="item-editor-item-resizer-text" class="has-icon"
                                           placeholder="<?=__('e.g. 960')?>">
                                    <span class="unit-indicator">px</span>
                                </span>
                        <span class="icon-eraser reset-button" data-role="item-width-reset"
                              title="<?=__('Remove custom item width')?>"></span>
                    </div>
                </div>

            </div>

        </section>

    </div>
    <div class="item-editor-item-related sidebar-right-section-box" id="item-editor-item-property-bar">
        <section class="tool-group clearfix" id="sidebar-right-item-properties">
            <h2><?=__('Item Properties')?></h2>

            <div class="panel"></div>
        </section>
    </div>
    <div class="item-editor-item-related sidebar-right-section-box" id="item-editor-text-property-bar">
        <section class="tool-group clearfix" id="sidebar-right-text-block-properties">
            <h2><?=__('Text Block Properties')?></h2>

            <div class="panel"></div>
        </section>
    </div>
    <div class="item-editor-interaction-related sidebar-right-section-box" id="item-editor-interaction-property-bar">
        <section class="tool-group clearfix" id="sidebar-right-interaction-properties">
            <h2><?=__('Interaction Properties')?></h2>

            <div class="panel"></div>
        </section>
    </div>
    <div class="item-editor-choice-related sidebar-right-section-box" id="item-editor-choice-property-bar">
        <section class="tool-group clearfix" id="sidebar-right-choice-properties">
            <h2><?=__('Choice Properties')?></h2>

            <div class="panel"></div>
        </section>
    </div>
    <div class="item-editor-response-related sidebar-right-section-box" id="item-editor-response-property-bar">
        <section class="tool-group clearfix" id="sidebar-right-response-properties">
            <h2><?=__('Response Properties')?></h2>

            <div class="panel"></div>
        </section>
    </div>
    <div class="item-editor-modal-feedback-related sidebar-right-section-box" id="item-editor-modal-feedback-property-bar">
        <section class="tool-group clearfix" id="sidebar-right-response-properties">
            <h2><?=__('Modal Feedback Prop.')?></h2>

            <div class="panel"></div>
        </section>
    </div>
    <div class="item-editor-body-element-related sidebar-right-section-box" id="item-editor-body-element-property-bar">
        <section class="tool-group clearfix" id="sidebar-right-body-element-properties">
            <h2><?=__('Element Properties')?></h2>

            <div class="panel"></div>
        </section>
    </div>
</div>
<!-- /right sidebar -->

<style>
    body .tao-scope .item-editor-item {
        background:white url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABsEAAAAzCAMAAADxc1b/AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyFpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDIxIDc5LjE1NDkxMSwgMjAxMy8xMC8yOS0xMTo0NzoxNiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChXaW5kb3dzKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo2N0FGNTU3NDEwREIxMUU0QjA4MkI1QjU3OTRENURFMCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo2N0FGNTU3NTEwREIxMUU0QjA4MkI1QjU3OTRENURFMCI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjY3QUY1NTcyMTBEQjExRTRCMDgyQjVCNTc5NEQ1REUwIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjY3QUY1NTczMTBEQjExRTRCMDgyQjVCNTc5NEQ1REUwIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+6Z3a2QAAAwBQTFRFyL2lv6aNpr7K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) no-repeat
    }
</style>

<!-- item panel -->
<main id="item-editor-panel" class="clearfix tao-scope">
    <div id="item-editor-scroll-area">
        <!-- item goes here -->
    </div>
</main>
<!-- /item panel -->
</div>
<!-- preview: item may needed to be saved before -->
<div class="preview-modal-feedback modal">
    <div class="modal-body clearfix">
        <p><?=__('The item needs to be saved before it can be previewed')?></p>
        <div class="rgt">
            <button class="btn-regular small cancel" type="button"><?=__('Cancel')?></button>
            <button class="btn-info small save" type="button"><?=__('Save')?></button>
        </div>
    </div>
</div>

<div id="mediaManager"></div>
</div>

<script>
    <?if(tao_helpers_Mode::is('production')):?>
        require(['taoQtiItem/controller/routes'], function(){
        <? endif ?>

            require(['taoQtiItem/controller/creator/main'], function(controller){
                controller.start({
                    uri : '<?=get_data('uri')?>',
                    lang : '<?=get_data('lang')?>',
                    baseUrl : '<?=get_data('baseUrl')?>'
                });
            });

        <?if(tao_helpers_Mode::is('production')):?>
    });
    <? endif ?>
</script>
