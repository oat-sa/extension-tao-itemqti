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
            data-min="{{lowerThreshold}}"
            data-max="{{upperThreshold}}"
        />

        <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
        <span class="tooltip-content">{{min.helpMessage}}</span>
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
            data-min="{{lowerThreshold}}"
            data-max="{{upperThreshold}}"
        />

        <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
        <span class="tooltip-content">{{max.helpMessage}}</span>
    </div>
</div>
