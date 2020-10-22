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
        {{__ "Enable scrolling"}}
    </label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <span class="tooltip-content">
{{__ "Select checkbox to enable scrolling for text block."}}
    </span>
</div>
