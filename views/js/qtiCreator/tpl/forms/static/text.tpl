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

{{> scrollingSelect }}

<div class="panel writingMode-panel" style="display:none;">
    <hr />
    <h3>{{__ "Direction of writing"}}</h3>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
    <span class="tooltip-content">{{__ "Switches the text block's direction of writing between horizontal and vertical."}}</span>
    <div>
        <label class="smaller-prompt">
            <input type="radio" name="writingMode" value="horizontal" />
            <span class="icon-radio"></span>
            {{__ "Horizontal text"}}
        </label>
        <br>
        <label class="smaller-prompt">
            <input type="radio" name="writingMode" value="vertical" />
            <span class="icon-radio"></span>
            {{__ "Vertical text"}}
        </label>
    </div>
</div>

