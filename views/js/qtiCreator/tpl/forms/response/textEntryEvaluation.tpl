<hr />

<div class="panel text-entry-evaluation-panel">
    <h3 class="full-width">
        {{__ "Evaluation"}}
        <span class="icon-help tooltipstered" data-tooltip="~ .evaluation-section-tooltip" data-tooltip-theme="info"></span>
        <span class="tooltip-content evaluation-section-tooltip">
            <b>{{__ "Defines how multiple Text Entry interactions are evaluated."}}</b><br />
            <b>{{__ "Ordered"}}</b> — {{__ "each response must be entered in its corresponding field."}}<br />
            <b>{{__ "Unordered"}}</b> — {{__ "responses can be entered in any field and are evaluated as a set."}}
        </span>
    </h3>

    <label class="smaller-prompt text-entry-evaluation-toggle">
        <input type="checkbox" name="evaluateAsUmfi" {{#if evaluateAsUmfi}}checked="checked"{{/if}} />
        <span class="icon-checkbox"></span>
        <span class="label-text">{{__ "Evaluate Text Entry interactions as Unordered Multi-Field"}}</span>
    </label>

    <div class="text-entry-evaluation-expanded{{#unless evaluateAsUmfi}} hidden{{/unless}}">
        <p class="text-entry-evaluation-info">
            <span class="icon-info"></span>
            <span class="info-text">{{__ "Applies to all Text Entry interactions in this item"}}</span>
        </p>

        <label class="smaller-prompt allow-lexical-fields-on-scoring">
            <input type="checkbox" name="allowLexicalFieldsOnScoring" {{#if allowLexicalFieldsOnScoring}}checked="checked"{{/if}} />
            <span class="icon-checkbox"></span>
            <span class="label-text">{{__ "Allow evaluators to extend the Lexical Field list"}}</span>
        </label>
        <p class="text-entry-evaluation-info">
            <span class="icon-info"></span>
            <span class="info-text">{{__ "Enable this option if the list of expected answers may need to be extended during evaluation."}}</span>
        </p>

        <div class="lexical-fields-panel">
            <h4 class="lexical-fields-title">
                {{__ "Lexical fields"}}
                <span class="icon-help tooltipstered" data-tooltip="~ .lexical-fields-tooltip" data-tooltip-theme="info"></span>
                <span class="tooltip-content lexical-fields-tooltip">
                    {{__ "A Lexical Field groups multiple accepted answer variants into a single expected response. The first variant is used as the canonical label displayed during scoring."}}
                </span>
            </h4>
            <a href="#" class="action-link add-lexical-field-action" data-action="add-lexical-field">
                <span class="icon-add"></span>{{__ "Add lexical field"}}
            </a>
            <div class="lexical-field-groups">
                {{#each lexicalGroups}}
                {{> lexicalFieldGroup this}}
                {{/each}}
            </div>
        </div>
    </div>
</div>
