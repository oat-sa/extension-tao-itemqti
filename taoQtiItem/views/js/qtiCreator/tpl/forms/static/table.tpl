<div class="panel">
    <label for="hAlign">{{__ 'Alignment'}}</label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
    <div class="tooltip-content">
        {{__ "Choose the horizontal alignment for the table."}}
    </div>
    <select name="hAlign" class="select2" data-has-search="false">
        {{#each hAlignOptions}}
        <option value="{{value}}"{{#if selected}} selected="selected"{{/if}}>{{name}}</option>
        {{/each}}
    </select>
</div>