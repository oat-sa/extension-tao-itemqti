<div
    {{#if attributes.id}}id="{{attributes.id}}"{{/if}}
    class="qti-interaction qti-blockInteraction qti-extendedTextInteraction{{#if attributes.class}} {{attributes.class}}{{/if}}"
    data-serial="{{serial}}"
    data-qti-class="extendedTextInteraction"{{#if attributes.xml:lang}}
    lang="{{attributes.xml:lang}}"{{/if}}{{#if attributes.data-scrolling}}
    data-scrolling="{{attributes.data-scrolling}}"{{/if}}
    {{#if attributes.data-scrolling-height}} data-scrolling-height="{{attributes.data-scrolling-height}}"{{/if}}
>
    {{#if prompt}}{{{prompt}}}{{/if}}
    <div class="instruction-container"></div>
    {{#if multiple}}
        {{#equal attributes.format "xhtml"}}
            {{#each maxStringLoop}}
                <div class="text-container text-{{attributes.format}} solid{{#if attributes.class}} attributes.class{{/if}}" name="{{attributes.identifier}}_{{this}}" contenteditable></div>
            {{/each}}
        {{else}}
            {{#each maxStringLoop}}
                <textarea
                    class="text-container text-{{attributes.format}} solid{{#if attributes.class}} attributes.class{{/if}}"
                    name="{{attributes.identifier}}_{{this}}"
                    {{#if attributes.patternMask}}pattern="{{attributes.patternMask}}"{{/if}}
                    aria-labelledby="{{promptId}}"
                ></textarea>
            {{/each}}
        {{/equal}}
    {{else}}
        {{#equal attributes.format xhtml}}
        <div class="text-container text-{{attributes.format}} solid{{#if attributes.class}} attributes.class{{/if}}" contenteditable></div>
        {{else}}
            <textarea
                class="text-container text-{{attributes.format}} solid{{#if attributes.class}} attributes.class{{/if}}"
                {{#if attributes.patternMask}}pattern="{{attributes.patternMask}}"{{/if}}
                aria-labelledby="{{promptId}}"
            ></textarea>
        {{/equal}}
    {{/if}}
    <div class="text-counter">
        {{#if attributes.expectedLength}}
            {{{dompurify constraintHints.expectedLength}}}
        {{else}}
            <span class="text-counter-chars"{{#unless maxLength}} style="display: none"{{/unless}}>{{{dompurify constraintHints.maxLength}}}</span>
            <span class="text-counter-words"{{#unless maxWords}} style="display: none"{{/unless}}>{{{dompurify constraintHints.maxWords}}}</span>
        {{/if}}
    </div>
</div>
