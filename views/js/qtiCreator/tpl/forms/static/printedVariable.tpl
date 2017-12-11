<div class="panel">
    <h3>{{__ 'Printed Variable'}}</h3>

    <label for="identifier">{{__ "Identifier"}}</label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
    <div class="tooltip-content">
        {{__ "Select the outcome variable you want to display."}}.
    </div>

    <select name="identifier" class="select2" data-has-search="false">
        <option value="">{{__ "Select"}}</option>
        {{#each outcomes}}
        <option value="{{value}}"{{#if selected}} selected{{/if}}>{{name}}</option>
        {{/each}}
    </select>

</div>

<div class="panel">
    <label for="format" class="has-icon">{{__ "Format"}}</label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <div class="tooltip-content">
        {{__ "The format conversion specifier to use when converting numerical values to strings. See QTI Number Formatting Rules for details."}}
    </div>

    <input id="format" type="text" name="format" value="{{format}}"/>
</div>

<div class="panel">
    <label for="powerForm" class="has-icon">{{__ "Power form"}}</label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <div class="tooltip-content">
        {{__ "If the variable value is a float and powerForm is set to 'false', the variable will be rendered using the 'e' or 'E' format. If the powerform is set to 'true', the form 'e+n' is changed to 'x 10n'."}}
    </div>

    <input id="powerForm" type="checkbox" name="powerForm" value="true" {{#if powerForm}} checked="checked"{{/if}}/>
</div>

<div class="panel">
    <label for="base">{{__ 'Base'}}</label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <div class="tooltip-content">
        {{__ 'The number base to use when converting integer variables to strings with the i conversion type code.'}}
    </div>

    <input name="base" type="text" data-increment="1" data-min="0" value="{{base}}" />
</div>

<div class="panel">
    <label for="index">{{__ 'Index'}}</label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <div class="tooltip-content">
        {{__ 'The index to use when displaying a variable of ordered cardinality. If a variable of ordered cardinality is to be displayed and index is not set, all the values in the container are displayed.'}}
    </div>

    <input name="index" type="text" data-increment="1" data-min="-1" value="{{index}}" />
</div>

<div class="panel">
    <label for="delimiter">{{__ 'Delimiter'}}</label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <div class="tooltip-content">
        {{__ 'The delimiter to use between values when displaying variables of ordered, multiple or record cardinality. ";" is default when delimiter is not declared. Implementations can override this default with personal preferences or locale settings.'}}
    </div>

    <input name="delimiter" type="text" value="{{delimiter}}" />
</div>

<div class="panel">
    <label for="field">{{__ 'Field'}}</label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <div class="tooltip-content">
        {{__ 'The field specifier to use when displaying variables of record cardinality.'}}
    </div>

    <input name="field" type="text" value="{{field}}" />
</div>

<div class="panel">
    <label for="mappingIndicator">{{__ 'Mapping Indicator'}}</label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <div class="tooltip-content">
        {{__ 'The mapping indicator to use between field name and field value when displaying variables of record cardinality. "=" is default when mappingIndicator is not declared. Implementations can override this default with personal preferences or locale settings.'}}
    </div>

    <input name="mappingIndicator" type="text" value="{{mappingIndicator}}" />
</div>