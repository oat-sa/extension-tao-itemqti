<div class="qti-interaction qti-blockInteraction qti-extendedTextInteraction" data-serial="{{serial}}" data-qti-class="extendedTextInteraction">
    {{#if prompt}}{{{prompt}}}{{/if}}
    <div class="instruction-container"></div>
    {{#if multiple}}
        {{#equal attributes.format "xhtml"}}
            {{#each maxStringLoop}}
                <div class="text-container text-{{attributes.format}} solid{{#if attributes.class}} attributes.class{{/if}}" name="{{attributes.identifier}}_{{this}}" contenteditable></div>
            {{/each}}
        {{else}}
            {{#each maxStringLoop}}
                <textarea class="text-container text-{{attributes.format}} solid{{#if attributes.class}} attributes.class{{/if}}" name="{{attributes.identifier}}_{{this}}"></textarea>
            {{/each}}
        {{/equal}}
    {{else}}
        {{#equal attributes.format xhtml}}
            <div class="text-container text-{{attributes.format}} solid{{#if attributes.class}} attributes.class{{/if}}" contenteditable></div>
        {{else}}
            <textarea class="text-container text-{{attributes.format}} solid{{#if attributes.class}} attributes.class{{/if}}"></textarea>
        {{/equal}}
        {{#with attributes.expectedLength}}
            <div class="text-maxwords">
                {{#with attributes.expectedLengthmandatory}}
                    <span class="text-words-count">{{attributes.expectedLength}}</span> {{_ "word(s) remained"}}
                {{else}}
                    {{_ "we expect about"}} {{attributes.expectedLength}} {{_ "chars. It's just an indication. You are now at"}} <span class="text-words-count">0</span> {{_ "word(s)"}}.
                {{/with}}
            </div>
        {{/with}}
    {{/if}}
</div>
