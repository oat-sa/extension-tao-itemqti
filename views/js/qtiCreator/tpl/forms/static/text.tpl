<div class="panel">
    <label for="textBlockCssClass">{{__ "Text Block CSS Class"}}</label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <div class="tooltip-content">{{__ 'Set a CSS class name in order to customize the display style.'}}</div>
    <input type="text" name="textBlockCssClass" value="{{textBlockCssClass}}" />
</div>

{{#if scrollingAvailable}}
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
{{/if}}

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

<div class="panel" style="display:none;" id="writingMode-panel">
    <hr />
    <label for="">{{__ "Direction of writing"}}</label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
    <span class="tooltip-content">{{__ "Switches the text block's direction of writing between horizontal and vertical."}}</span>
    <div>
        <label class="no-margin">
            <input type="radio" name="writingMode" value="horizontal" />
            <span class="icon-radio"></span>
            {{__ "Horizontal text"}}
        </label>
        <br>
        <label class="no-margin">
            <input type="radio" name="writingMode" value="vertical" />
            <span class="icon-radio"></span>
            {{__ "Vertical text"}}
        </label>
    </div>
</div>
