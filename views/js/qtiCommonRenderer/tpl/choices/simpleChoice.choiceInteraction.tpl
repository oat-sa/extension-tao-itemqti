<li class="qti-choice qti-simpleChoice" data-identifier="{{attributes.identifier}}" data-serial="{{serial}}"{{#if attributes.xml:lang}} lang="{{attributes.xml:lang}}"{{/if}}>
    <div class="pseudo-label-box">
        <label class="real-label">
            {{#if unique}}
            <input type="radio" name="response-{{interaction.serial}}" value="{{attributes.identifier}}" tabindex="1">
            <span class="icon-radio"></span>
            {{else}}
            <input type="checkbox" name="response-{{interaction.serial}}" value="{{attributes.identifier}}" tabindex="1">
            <span class="icon-checkbox"></span>
            {{/if}}
        </label>
        <div class="label-box">
            <div class="label-content clear" contenteditable="false">
                {{{body}}}
                <svg class="overlay-answer-eliminator">
                    <line x1="0" y1="100%" x2="100%" y2="0"/>
                    <line x1="0" y1="0" x2="100%" y2="100%"/>
                </svg>
            </div>
        </div>
    </div>
    <label data-eliminable="container" data-label="{{__ "Eliminate"}}">
        <span data-eliminable="trigger" class="icon-checkbox"></span>
    </label>
</li>
