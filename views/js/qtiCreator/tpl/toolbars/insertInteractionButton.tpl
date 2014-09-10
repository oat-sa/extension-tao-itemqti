<li
{{#if subGroup}}
    data-sub-group="{{subGroup}}"
{{/if}}
    data-qti-class="{{qtiClass}}"
    
{{#if disabled}}
    class="disabled"
    title="element available in the final release"
{{else}}
    title="{{title}}"
{{/if}}
>
    {{#if icon-font}}
    <span class="{{icon}}"></span>
    {{else}}
    <img class="interaction-sidebar-icon" src="{{icon}}">
    {{/if}}
    
    <div class="truncate">{{short}}</div>
</li>