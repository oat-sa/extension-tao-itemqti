<div>
    <label for="lang">
        {{__ "Language"}}
    </label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <span class="tooltip-content">
        {{__ "Define item language."}}
    </span>
    <select class="select2" name="lang" data-has-search="false">
        {{#each languagesList}}
            <option value="{{@key}}"{{#equal @key ../lang}} selected="selected"{{/equal}}{{#includes ../rtl @key}} class="rtl-lang"{{/includes}}>{{this}}</option>
        {{/each}}
    </select>
</div>
