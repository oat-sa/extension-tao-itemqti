<div class="panel">
    <label for="href">{{__ 'File'}}</label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <div class="tooltip-content">{{__ 'The file path to the shared stimulus.'}}</div>
    <input type="text" name="href" value="{{href}}" data-validate="$notEmpty;" readonly/>
    <button class="btn-info small block" data-role="upload-trigger">{{__ 'Select shared stimulus'}}</button>
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
    <span class="tooltip-content">{{__ "Select height of passage base of container height"}}</span>
    <select name="scrollingHeight" class="select2" data-has-search="false">
        {{#each scrollingHeights}}
        <option value="{{value}}" {{#if selected}}selected="selected"{{/if}}>{{name}}</option>
        {{/each}}
    </select>
</div>
