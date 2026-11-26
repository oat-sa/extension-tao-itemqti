<div class="min-max">
    <div class="panel">
        <label for="{{min.fieldName}}">{{__ 'Min'}}</label>
        {{#unless hideTooltips}}
            <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
            <div class="tooltip-content">{{min.helpMessage}}</div>
        {{/unless}}
        <div>
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
        </div>
    </div>
    <div class="panel">
        <label for="{{max.fieldName}}">{{__ 'Max'}}</label>
        {{#unless hideTooltips}}
            <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
            <div class="tooltip-content">{{max.helpMessage}}</div>
        {{/unless}}
        <div>
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
        </div>
    </div>
</div>