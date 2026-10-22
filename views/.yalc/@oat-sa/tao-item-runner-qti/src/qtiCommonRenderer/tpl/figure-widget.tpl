{{#if attributes.showFigure}}
<figure 
    data-serial="{{serial}}"
    {{#if attributes.class}} class="{{attributes.class}}"{{/if}}
    {{#if attributes.xml:lang}} lang="{{attributes.xml:lang}}"{{/if}}
>{{{body}}}</figure>
{{else}}
<span data-serial="{{serial}}" data-figure="true">
    {{{body}}}
</span>
{{/if}}
