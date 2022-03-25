<div class="min-max">
    <div>
        <label for="{{min.fieldName}}" class="spinner" >{{__ 'Min'}}</label>

        {{#if min.toggler}}
            <label>
                <input type="checkbox" name="{{min.fieldName}}-toggler"  />
                <span class="icon-checkbox"></span>
            </label>
        {{/if}}

        <input
            type="text"
            name="{{min.fieldName}}"
            value="{{min.value}}"
            data-increment="1"
            data-min="{{#if min.lowerThreshold}}{{min.lowerThreshold}}{{else}}{{lowerThreshold}}{{/if}}"
            data-max="{{#if min.upperThreshold}}{{min.upperThreshold}}{{else}}{{upperThreshold}}{{/if}}"
        />
        {{#unless hideTooltips}}
            <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
            <span class="tooltip-content">{{min.helpMessage}}</span>
        {{/unless}}
    </div>
    <div>
        <label for="{{max.fieldName}}" class="spinner" >{{__ 'Max'}}</label>

        {{#if max.toggler}}
            <label>
                <input type="checkbox" name="{{max.fieldName}}-toggler" />
                <span class="icon-checkbox"></span>
            </label>
        {{/if}}

        <input
            type="text"
            name="{{max.fieldName}}"
            value="{{max.value}}"
            data-increment="1"
            data-min="{{#if max.lowerThreshold}}{{max.lowerThreshold}}{{else}}{{lowerThreshold}}{{/if}}"
            data-max="{{#if max.upperThreshold}}{{max.upperThreshold}}{{else}}{{upperThreshold}}{{/if}}"
        />
        {{#unless hideTooltips}}
            <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
            <span class="tooltip-content">{{max.helpMessage}}</span>
        {{/unless}}
    </div>
</div>
