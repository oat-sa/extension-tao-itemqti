<?php
use oat\tao\helpers\Template;
?>

<link rel="stylesheet" href="<?=Template::css('apip-creator.css')?>" />

<div id="item-editor-scope" data-content-target="wide">
    <div class="wrapper clearfix content sidebar-popup-parent" id="item-editor-wrapper">
        <!-- item panel -->
        <main id="item-editor-panel" class="clearfix">
            <div class="item-editor-action-bar action-bar plain content-action-bar horizontal-action-bar">
                <ul class="plain item-editor-menu action-group">
                    <li id="save-trigger" class="btn-info small">
                        <span class="li-inner">
                            <span class="icon-save"></span>
                            <?=__('Save')?>
                        </span>
                    </li>
                </ul>
                <div id="item-editor-label" class="truncate action-group"></div>
            </div>
            <div id="item-editor-scroll-outer">
                <div id="item-editor-scroll-inner">
                    <!-- item goes here -->
                </div>
            </div>
        </main>
        <!-- /item panel -->
    </div>
</div>

<script>
    requirejs.config({
        config : {
            'taoQtiItem/controller/apip-creator/main' : <?=json_encode(get_data('config'))?>
        }
    });
</script>
