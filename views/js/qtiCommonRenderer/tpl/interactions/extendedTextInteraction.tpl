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
                    {{__ "You can enter a maximum of"}}
                {{else}}
                    {{__ "We expect about"}}
                {{/if}}

                {{attributes.expectedLength}} {{__ "chars".}}
                {{#unless attributes.expectedLengthmandatory}}
                    {{__ "It's just an indication."}}
                {{/unless}}
                {{__ "You are now at"}} <span class="text-count">0</span> {{__ "char(s)"}}.
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
            <div class="text-maxwords">
                {{#if attributes.expectedLengthmandatory}}
                    {{__ "You can enter a maximum of"}}
                {{else}}
                    {{__ "We expect about"}}
                {{/if}}

                {{attributes.expectedLength}} {{__ "chars".}}
                {{#unless attributes.expectedLengthmandatory}}
                    {{__ "It's just an indication."}}
                {{/unless}}
                {{__ "You are now at"}} <span class="text-count">0</span> {{__ "char(s)"}}.
            </div>
        {{/if}}
        {{!-- If there's a max words --}}

    {{/if}}
</div>
