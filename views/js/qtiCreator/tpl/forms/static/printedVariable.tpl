<div class="itemref-props props clearfix">

    <h3>{{__ 'Printed Variable'}}</h3>

    <div class="grid-row">
        <div class="col-5">
            <label for="identifier">{{__ 'Identifier'}}</label>
        </div>
        <div class="col-6">
            <select name="identifier" class="select2" data-has-search="false">
                <option value="">{{__ "Select"}}</option>
                {{#each outcomes}}
                <option value="{{value}}"{{#if selected}} selected{{/if}}>{{name}}</option>
                {{/each}}
            </select>
        </div>
        <div class="col-1 help">
            <span class="icon-help" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
            <div class="tooltip-content">
                {{__ 'Select the outcome variable you want to display.'}}
            </div>
        </div>
    </div>
</div>