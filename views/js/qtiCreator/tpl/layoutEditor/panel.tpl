<hr>
<div class="panel" id="item-editor-layout-panel">
    <h3>{{__ "Layout"}}</h3>
    <span class="icon-help tooltipstered" data-tooltip-theme="info" data-tooltip="~ .tooltip-content:first"></span>
    <div class="tooltip-content">
        {{__ "The scrollable multi-column layout configuration is optimized for items with a single row of content only. Both columns will scroll independently and fit the available page height."}}
    </div>
    <div id="item-editor-scrollable-multi-column" data-target="body div.grid-row">
        <label>
            <input name="scrollable-multi-column" type="checkbox"/>
            <span class="icon-checkbox"></span>
            {{__ "Scrollable multi-column"}}
        </label>
    </div>
</div>
