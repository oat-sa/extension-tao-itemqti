<img 
    data-serial="{{serial}}" 
    data-qti-class="img" 
    src="{{attributes.src}}" 
    alt="{{attributes.alt}}" 
    {{#if attributes.id}}id="{{attributes.id}}"{{/if}}
    {{#if attributes.class}}class="{{attributes.class}}"{{/if}}
    {{#if attributes.height}}height="{{attributes.height}}" {{/if}}
    {{#if attributes.width}}width="{{attributes.width}}" {{/if}}
    {{#if attributes.xml:lang}} lang="{{attributes.xml:lang}}"{{/if}}
    style="{{#if attributes.height}}height: {{attributes.height}}px; {{/if}}{{#if attributes.width}}width: {{attributes.width}}px; {{/if}}"
    />