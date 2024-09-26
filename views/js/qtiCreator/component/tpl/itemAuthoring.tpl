<div id="item-editor-scope" data-content-target="wide">

    <nav class="action-bar plain content-action-bar horizontal-action-bar">
        <ul class="menu-left action-group plain item-editor-menu"></ul>

        <ul class="menu action-group plain item-editor-menu"></ul>

        <ul class="menu-right action-group plain item-editor-menu">
            <li id="appearance-trigger" class="btn-info small rgt">
                <span class="li-inner">
                    <span class="icon-item"></span>
                    <span class="icon-style"></span>
                    <span class="menu-label" data-item="{{__ 'Item properties'}}"
                          data-style="{{__ 'Style Editor'}}">{{__ 'Style Editor'}}</span>
                </span>
            </li>
        </ul>
    </nav>
    <div class="wrapper clearfix content sidebar-popup-parent" id="item-editor-wrapper"></div>
    <!-- preview: item may needed to be saved before -->
    <div class="preview-modal-feedback modal">
        <div class="modal-body clearfix">
            <p>{{__ 'The item needs to be saved before it can be previewed'}}</p>

            <div class="rgt">
                <button class="btn-regular small cancel" type="button">{{__ 'Cancel'}}</button>
                <button class="btn-info small save" type="button">{{__ 'Save'}}</button>
            </div>
        </div>
    </div>

    <div id="mediaManager"></div>
    <div id="modal-container"></div>
</div>
