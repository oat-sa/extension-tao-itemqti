<hr>
<div class="panel" id="item-editor-layout-panel">
    <h3>{{__ "Layout"}}</h3>
    {{#if multiColEnabled}}
        <div id="item-editor-scrollable-multi-column" data-target=".qti-itemBody div.grid-row">
            <label>
                <input name="scrollable-multi-column" type="checkbox"/>
                <span class="icon-checkbox"></span>
                {{__ "Scrollable multi-column"}}
            </label>
            <span class="icon-help tooltipstered" data-tooltip-theme="info" data-tooltip="~ .tooltip-content:first"></span>
            <div class="tooltip-content">
                {{__ "The scrollable multi-column layout configuration is optimized for items with a single row of content only. Both columns will scroll independently and fit the available page height."}}
            </div>
        </div>
    {{/if}}
    {{#if separatorEnabled}}
        <div id="item-editor-separator-between-columns" data-target=".qti-itemBody">
            <label>
                <input name="separator-between-columns" type="checkbox"/>
                <span class="icon-checkbox"></span>
                {{__ "Column separator"}}
            </label>
            <span class="icon-help tooltipstered" data-tooltip-theme="info" data-tooltip="~ .tooltip-content:first"></span>
            <div class="tooltip-content">
                {{__ "Toggles the display of a vertical separator between columns."}}
            </div>
        </div>
    {{/if}}
</div>
