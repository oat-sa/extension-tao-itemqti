<div class="lexical-field-group" data-group-index="{{index}}">
    <div class="lexical-field-group-header">
        <input type="text"
               id="lexicalFieldIdentifier-{{index}}"
               class="lexical-field-identifier"
               name="lexicalFieldIdentifier-{{index}}"
               value="{{identifier}}"
               placeholder="e.g. GROUP_1"
               aria-label="{{__ 'Lexical field identifier'}}"
               data-validate="$notEmpty; $qtiLexicalGroupIdentifier{{#if textEntrySerial}}(serial={{textEntrySerial}}){{/if}};" />
        <span class="trigger icon-bin lexical-field-remove"
              data-action="remove-lexical-field"
              role="button"
              tabindex="0"
              title="{{__ 'Remove lexical field'}}"
              aria-label="{{__ 'Remove lexical field'}}"></span>
    </div>
    <div class="lexical-field-group-body">
        <p class="lexical-field-variants-label" id="lexicalFieldVariantsLabel-{{index}}">{{__ "Variants"}}</p>
        <div class="lexical-field-variant-chips">
            {{#each synonyms}}
            {{#if this}}
            <span class="lexical-field-variant-chip" data-variant-index="{{@index}}">
                <span class="variant-text">{{this}}</span>
                <span class="icon-close variant-remove"
                      data-action="remove-variant"
                      role="button"
                      tabindex="0"
                      title="{{__ 'Remove variant'}}"
                      aria-label="{{__ 'Remove variant'}}"></span>
            </span>
            {{/if}}
            {{/each}}
            {{#if draftVariant}}
            <input type="text"
                   id="lexicalFieldVariant-{{index}}"
                   class="lexical-field-variant-input"
                   name="lexicalFieldVariant-{{index}}"
                   value=""
                   placeholder="{{__ 'Variant'}}"
                   aria-labelledby="lexicalFieldVariantsLabel-{{index}}" />
            {{/if}}
        </div>
        <a href="#" class="action-link add-variant-action" data-action="add-variant">
            <span class="icon-add"></span>{{__ "Add variant"}}
        </a>
    </div>
</div>
