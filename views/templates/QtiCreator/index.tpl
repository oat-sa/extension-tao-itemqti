<?php
use oat\tao\helpers\Template;
?>

<link rel="stylesheet" href="<?= Template::css('qti-runner.css') ?>" />
<link rel="stylesheet" href="<?= Template::css('themes/default.css') ?>" />
<link rel="stylesheet" href="<?= Template::css('item-creator.css') ?>" />
<link rel="stylesheet" href="<?= Template::css('preview.css','taoItems') ?>" />

<div id="item-editor-scope" data-content-target="wide">

    <nav class="action-bar plain content-action-bar horizontal-action-bar">
        <ul class="menu-left action-group plain item-editor-menu"></ul>

        <ul class="menu action-group plain item-editor-menu"></ul>

        <ul class="menu-right action-group plain item-editor-menu" id="item-editor-item-mode-tabs" role="tablist">
            <li role="tab" data-tab="style" class="btn-info small" aria-selected="false"
                title="<?= __('Style Editor') ?>" aria-label="<?= __('Style Editor') ?>">
                <span class="li-inner">
                    <span class="icon-style" aria-hidden="true"></span>
                    <span class="tab-label menu-label"><?= __('Style Editor') ?></span>
                </span>
            </li>
            <li role="tab" data-tab="properties" class="btn-info small active" aria-selected="true"
                title="<?= __('Properties') ?>" aria-label="<?= __('Properties') ?>">
                <span class="li-inner">
                    <span class="icon-settings" aria-hidden="true"></span>
                    <span class="tab-label menu-label"><?= __('Properties') ?></span>
                </span>
            </li>
            <li role="tab" data-tab="comments" class="btn-info small" aria-selected="false"
                data-label="<?= __('Comments') ?>" title="<?= __('Comments') ?>" aria-label="<?= __('Comments') ?>">
                <span class="li-inner">
                    <span class="icon-speech-bubble" aria-hidden="true"></span>
                    <span class="tab-label menu-label"><?= __('Comments') ?></span>
                </span>
            </li>
        </ul>
    </nav>

    <div class="wrapper clearfix content sidebar-popup-parent" id="item-editor-wrapper"></div>

    <!-- preview: item may needed to be saved before -->
    <div class="preview-modal-feedback modal">
        <div class="modal-body clearfix">
            <p><?= __('The item needs to be saved before it can be previewed') ?></p>

            <div class="rgt">
                <button class="btn-regular small cancel" type="button"><?= __('Cancel') ?></button>
                <button class="btn-info small save" type="button"><?= __('Save') ?></button>
            </div>
        </div>
    </div>

    <div id="mediaManager"></div>
    <div id="modal-container"></div>
</div>

<script>
requirejs.config({
   config: {
       'taoQtiItem/controller/creator/index' : <?= json_encode(get_data('config')) ?>
   }
});
</script>
