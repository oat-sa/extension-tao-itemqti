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
        {{#if attributes.expectedLength}}
            <div class="text-maxwords">
                {{#if attributes.expectedLengthmandatory}}
                    <span class="text-words-count">{{attributes.expectedLength}}</span> {{__ "word(s) remained"}}
                {{else}}
                    {{__ "we expect about"}} {{attributes.expectedLength}} {{__ "chars. It's just an indication. You are now at"}} <span class="text-words-count">0</span> {{__ "word(s)"}}.
                {{/if}}
            </div>
        {{/if}}
    {{else}}
        {{#equal attributes.format xhtml}}
            <div class="text-container text-{{attributes.format}} solid{{#if attributes.class}} attributes.class{{/if}}" contenteditable></div>
        {{else}}
            <textarea class="text-container text-{{attributes.format}} solid{{#if attributes.class}} attributes.class{{/if}}"></textarea>
        {{/equal}}
        {{#if attributes.expectedLength}}
            <div class="text-maxwords">
                {{#if attributes.expectedLengthmandatory}}
                    <span class="text-words-count">{{attributes.expectedLength}}</span> {{__ "word(s) remained"}}
                {{else}}
                    {{__ "we expect about"}} {{attributes.expectedLength}} {{__ "chars. It's just an indication. You are now at"}} <span class="text-words-count">0</span> {{__ "word(s)"}}.
                {{/if}}
            </div>
        {{/if}}
    {{/if}}
</div>
