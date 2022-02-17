<div class="panel">
    <label for="textBlockCssClass">{{__ "Text Block CSS Class"}}</label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <div class="tooltip-content">{{__ 'Set a CSS class name in order to customize the display style.'}}</div>
    <input type="text" name="textBlockCssClass" value="{{textBlockCssClass}}" />
</div>

<div class="panel">
    <label>
        <input name="scrolling" type="checkbox" {{#if scrolling}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span>
        {{__ "Enable Scrolling"}}
    </label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <span class="tooltip-content">
        {{__ "Enable/disable scrolling."}}
    </span>
</div>

<div class="panel scrollingSelect">
    <label for="scrollingHeight" class="spinner">{{__ "Block height (%)"}}</label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <span class="tooltip-content">{{__ "Select height of text block base of container height"}}</span>
    <select name="scrollingHeight" class="select2" data-has-search="false">
        {{#each scrollingHeights}}
        <option value="{{value}}" {{#if selected}}selected="selected"{{/if}}>{{name}}</option>
        {{/each}}
    </select>
</div>
