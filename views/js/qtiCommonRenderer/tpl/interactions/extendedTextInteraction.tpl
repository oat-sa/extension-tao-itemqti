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
        {{!-- If there's an expected length or a max length --}}
        {{#if attributes.expectedLength}}
            <div class="text-counter">
                {{#if maxChars}}
                    {{__ "You can enter a maximum of"}} {{maxChars}} {{__ "chars".}}
                {{else}}
                    {{__ "We expect about"}} {{attributes.expectedLength}} {{__ "chars".}}
                {{/if}}
                {{#unless attributes.expectedLengthmandatory}}
                    {{__ "It's just an indication."}}
                {{/unless}}
                {{__ "You are now at"}} <span class="count-chars">0</span> {{__ "char(s)"}}.
            </div>
        {{/if}}
        {{!-- If there's a max words --}}
        {{#if maxWords}}
            <div class="text-counter">
                {{__ "You can enter a maximum of"}} {{maxWords}} {{__ "words".}}
                {{__ "You are now at"}} <span class="count-words">0</span> {{__ "words(s)"}}.
            </div>
        {{/if}}
    {{else}}
        {{#equal attributes.format xhtml}}
            <div class="text-container text-{{attributes.format}} solid{{#if attributes.class}} attributes.class{{/if}}" contenteditable></div>
        {{else}}
            <textarea class="text-container text-{{attributes.format}} solid{{#if attributes.class}} attributes.class{{/if}}"></textarea>
        {{/equal}}
        {{!-- If there's an expected length or a max length --}}
        {{#if attributes.expectedLength}}
            <div class="text-counter">
                {{#if maxChars}}
                    {{__ "You can enter a maximum of"}} {{maxChars}} {{__ "chars".}}
                {{else}}
                    {{__ "We expect about"}} {{attributes.expectedLength}} {{__ "chars".}}
                {{/if}}
                {{#unless attributes.expectedLengthmandatory}}
                    {{__ "It's just an indication."}}
                {{/unless}}
                {{__ "You are now at"}} <span class="count-chars">0</span> {{__ "char(s)"}}.
            </div>
        {{/if}}
        {{!-- If there's a max words --}}
        {{#if maxWords}}
            <div class="text-counter">
                {{__ "You can enter a maximum of"}} {{maxWords}} {{__ "words".}}
                {{__ "You are now at"}} <span class="count-words">0</span> {{__ "words(s)"}}.
            </div>
        {{/if}}
    {{/if}}
</div>
