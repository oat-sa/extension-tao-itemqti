<li
{{#if subGroup}}
    data-sub-group="{{subGroup}}"
{{/if}}
    data-qti-class="{{qtiClass}}"
    
{{#if dev}}
    class="dev"
{{/if}}

{{#if disabled}}
    class="disabled"
    title="element available in the final release"
{{else}}
    title="{{title}}"
{{/if}}
>
    {{#if iconFont}}
    <span class="{{icon}}"></span>
    {{else}}
    <img class="interaction-sidebar-icon" src="{{icon}}">
    {{/if}}
    
    <div class="truncate">{{short}}</div>
</li>