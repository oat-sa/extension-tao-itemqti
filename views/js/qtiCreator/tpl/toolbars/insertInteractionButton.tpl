<li
    data-sub-group="{{sub-group}}"
    data-qti-class="{{qtiClass}}"
    
{{#if disabled}}
    class="disabled"
    title="element available in the final release"
{{else}}
    title="{{title}}"
{{/if}}
>

    <span class="icon-{{icon}}"></span>

    <div class="truncate">{{short}}</div>
</li>