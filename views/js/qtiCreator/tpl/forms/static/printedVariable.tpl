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

    <div class="grid-row">
        <div class="col-5">
            <label for="format">{{__ 'Format'}}</label>
        </div>
        <div class="col-6">
            <input name="format" type="text" value="{{format}}" />
        </div>
        <div class="col-1 help">
            <span class="icon-help" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
            <div class="tooltip-content">
                {{__ 'The format conversion specifier to use when converting numerical values to strings. See QTI Number Formatting Rules for details.'}}
            </div>
        </div>
    </div>

    <div class="grid-row pseudo-label-box">
        <div class="col-5">
            <label for="powerForm">{{__ 'Power form'}}</label>
        </div>
        <div class="col-6">
            <label>
                <input type="checkbox" name="powerForm" value="true" {{#if powerForm}} checked="checked"{{/if}}/>
                <span class="icon-checkbox"></span>
            </label>
        </div>
        <div class="col-1 help">
            <span class="icon-help" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
            <div class="tooltip-content">
                {{__ "If the variable value is a float and powerForm is set to 'false', the variable will be rendered using the 'e' or 'E' format. If the powerform is set to 'true', the form 'e+n' is changed to 'x 10n'."}}
            </div>
        </div>
    </div>

    <div class="grid-row">
        <div class="col-5">
            <label for="base">{{__ 'Base'}}</label>
        </div>
        <div class="col-6">
            <input name="base" type="text" data-increment="1" data-min="0" value="{{base}}" />
        </div>
        <div class="col-1 help">
            <span class="icon-help" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
            <div class="tooltip-content">
                {{__ 'The number base to use when converting integer variables to strings with the i conversion type code.'}}
            </div>
        </div>
    </div>

    <div class="grid-row">
        <div class="col-5">
            <label for="index">{{__ 'Index'}}</label>
        </div>
        <div class="col-6">
            <input name="index" type="text" data-increment="1" data-min="-1" value="{{index}}" />
        </div>
        <div class="col-1 help">
            <span class="icon-help" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
            <div class="tooltip-content">
                {{__ 'The index to use when displaying a variable of ordered cardinality. If a variable of ordered cardinality is to be displayed and index is not set, all the values in the container are displayed.'}}
            </div>
        </div>
    </div>

    <div class="grid-row">
        <div class="col-5">
            <label for="delimiter">{{__ 'Delimiter'}}</label>
        </div>
        <div class="col-6">
            <input name="delimiter" type="text" value="{{delimiter}}" />
        </div>
        <div class="col-1 help">
            <span class="icon-help" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
            <div class="tooltip-content">
                {{__ 'The delimiter to use between values when displaying variables of ordered, multiple or record cardinality. ";" is default when delimiter is not declared. Implementations can override this default with personal preferences or locale settings.'}}
            </div>
        </div>
    </div>

    <div class="grid-row">
        <div class="col-5">
            <label for="field">{{__ 'Field'}}</label>
        </div>
        <div class="col-6">
            <input name="field" type="text" value="{{field}}" />
        </div>
        <div class="col-1 help">
            <span class="icon-help" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
            <div class="tooltip-content">
                {{__ 'The field specifier to use when displaying variables of record cardinality.'}}
            </div>
        </div>
    </div>

    <div class="grid-row">
        <div class="col-5">
            <label for="mappingIndicator">{{__ 'Mapping Indicator'}}</label>
        </div>
        <div class="col-6">
            <input name="mappingIndicator" type="text" value="{{mappingIndicator}}" />
        </div>
        <div class="col-1 help">
            <span class="icon-help" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
            <div class="tooltip-content">
                {{__ 'The mapping indicator to use between field name and field value when displaying variables of record cardinality. "=" is default when mappingIndicator is not declared. Implementations can override this default with personal preferences or locale settings.'}}
            </div>
        </div>
    </div>

</div>