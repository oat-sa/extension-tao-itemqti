<div id="item-editor-scope" data-content-target="wide">

    <nav class="action-bar plain content-action-bar horizontal-action-bar">
        <ul class="menu-left action-group plain item-editor-menu"></ul>

        <ul class="menu action-group plain item-editor-menu"></ul>

        <ul class="menu-right action-group plain item-editor-menu" id="item-editor-item-mode-tabs" role="tablist">
            <li role="tab" data-tab="style" class="btn-info small" aria-selected="false"
                title="{{__ 'Style Editor'}}" aria-label="{{__ 'Style Editor'}}">
                <span class="li-inner">
                    <span class="icon-style" aria-hidden="true"></span>
                    <span class="tab-label menu-label">{{__ 'Style Editor'}}</span>
                </span>
            </li>
            <li role="tab" data-tab="properties" class="btn-info small active" aria-selected="true"
                title="{{__ 'Properties'}}" aria-label="{{__ 'Properties'}}">
                <span class="li-inner">
                    <span class="icon-settings" aria-hidden="true"></span>
                    <span class="tab-label menu-label">{{__ 'Properties'}}</span>
                </span>
            </li>
            {{#if itemCommentsEnabled}}
            <li role="tab" data-tab="comments" class="btn-info small" aria-selected="false"
                data-label="{{__ 'Comments'}}" title="{{__ 'Comments'}}" aria-label="{{__ 'Comments'}}">
                <span class="li-inner">
                    <span class="icon-speech-bubble" aria-hidden="true"></span>
                    <span class="tab-label menu-label">{{__ 'Comments'}}</span>
                </span>
            </li>
            {{/if}}
        </ul>
    </nav>
    <div class="wrapper clearfix content sidebar-popup-parent" id="item-editor-wrapper"></div>
    <!-- preview: item may needed to be saved before -->
    <div class="preview-modal-feedback modal">
        <div class="modal-body clearfix">
            <p>{{__ 'The item needs to be saved before it can be previewed'}}</p>

            <div class="rgt">
                <button type="button" class="btn-regular small cancel">{{__ 'Cancel'}}</button>
                <button type="button" class="btn-info small save">{{__ 'Save'}}</button>
            </div>
        </div>
    </div>

    <div id="mediaManager"></div>
    <div id="modal-container"></div>
</div>
