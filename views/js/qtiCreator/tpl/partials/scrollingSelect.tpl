<div class="panel scrollingSelect dw-depended dw-horizontal">
    <label for="scrollingHeight" class="spinner">{{__ "Block height (%)"}}</label>
    <span class="icon-help tooltipstered" data-tooltip="~ #tooltip-scrolling-height" data-tooltip-theme="info"></span>
    <span id="tooltip-scrolling-height" class="tooltip-content">{{__ "Select height of text block based on container height"}}</span>
    <select id="scrollingHeight" name="scrollingHeight" class="select2" data-has-search="false" aria-describedby="tooltip-scrolling-height">
        {{#each scrollingHeights}}
        <option value="{{value}}" {{#if selected}}selected="selected"{{/if}}>{{name}}</option>
        {{/each}}
    </select>
</div>
<div class="panel scrollingSelect dw-depended dw-vertical">
    <label for="scrollingWidth" class="spinner">{{__ "Block width (%)"}}</label>
    <span class="icon-help tooltipstered" data-tooltip="~ #tooltip-scrolling-width" data-tooltip-theme="info"></span>
    <span id="tooltip-scrolling-width" class="tooltip-content">{{__ "Select width of text block based on container width"}}</span>
    <select id="scrollingWidth" name="scrollingWidth" class="select2" data-has-search="false" aria-describedby="tooltip-scrolling-width">
        {{#each scrollingWidths}}
        <option value="{{value}}" {{#if selected}}selected="selected"{{/if}}>{{name}}</option>
        {{/each}}
    </select>
</div>


