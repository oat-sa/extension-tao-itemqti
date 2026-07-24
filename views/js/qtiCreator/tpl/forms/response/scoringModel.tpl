<hr class="scoring-model-separator{{#unless showScoringModel}} hidden{{/unless}}" />

<div class="panel scoring-model-panel{{#unless showScoringModel}} hidden{{/unless}}">
    <h3 class="full-width">
        {{__ "Scoring Model"}}
        <span class="icon-help tooltipstered" data-tooltip="~ .scoring-model-section-tooltip" data-tooltip-theme="info"></span>
        <span class="tooltip-content scoring-model-section-tooltip">
            {{__ "Defines how interaction points are transformed into the final item score."}}
        </span>
    </h3>

    <div class="scoring-model-options">
        <div class="scoring-model-option" data-scoring-model-option="simpleSum">
            <label class="smaller-prompt">
                <input type="radio"
                       name="scoringModel"
                       value="simpleSum"
                       {{#if isSimpleSum}}checked="checked"{{/if}} />
                <span class="icon-radio"></span>
                <span class="label-text">{{__ "Simple sum"}}</span>
            </label>
            <div class="scoring-model-details scoring-model-simple-sum{{#unless isSimpleSum}} hidden{{/unless}}">
                <p class="scoring-model-description">
                    {{__ "Each interaction contributes its own points to the final item score. The final score is the sum of all interaction scores."}}
                </p>
            </div>
        </div>

        <div class="scoring-model-option" data-scoring-model-option="dichotomous">
            <label class="smaller-prompt">
                <input type="radio"
                       name="scoringModel"
                       value="dichotomous"
                       {{#if isDichotomous}}checked="checked"{{/if}} />
                <span class="icon-radio"></span>
                <span class="label-text">{{__ "Dichotomous"}}</span>
            </label>
            <div class="scoring-model-details scoring-model-dichotomous{{#unless isDichotomous}} hidden{{/unless}}">
                <p class="scoring-model-description">
                    {{__ "All-or-nothing scoring. A single score is awarded only when the configured threshold is reached."}}
                </p>
                <div class="scoring-model-dichotomous-fields">
                    <div class="panel">
                        <label for="dichotomousThreshold" class="spinner">{{__ "Correct responses"}}</label>
                        <input id="dichotomousThreshold"
                               type="text"
                               name="dichotomousThreshold"
                               value="{{dichotomousThreshold}}"
                               class="score"
                               data-increment="1"
                               data-min="0"
                               data-validate="$notEmpty; $numeric;"
                               data-validate-option="$lazy; $event(type=keyup)" />
                    </div>
                    <div class="panel">
                        <label for="dichotomousScore" class="spinner">{{__ "Scores"}}</label>
                        <input id="dichotomousScore"
                               type="text"
                               name="dichotomousScore"
                               value="{{dichotomousScore}}"
                               class="score"
                               data-increment="1"
                               data-min="0"
                               data-validate="$notEmpty; $numeric;"
                               data-validate-option="$lazy; $event(type=keyup)" />
                    </div>
                </div>
            </div>
        </div>

        <div class="scoring-model-option" data-scoring-model-option="polytomous">
            <label class="smaller-prompt">
                <input type="radio"
                       name="scoringModel"
                       value="polytomous"
                       {{#if isPolytomous}}checked="checked"{{/if}} />
                <span class="icon-radio"></span>
                <span class="label-text">{{__ "Polytomous"}}</span>
            </label>
            <div class="scoring-model-details scoring-model-polytomous{{#unless isPolytomous}} hidden{{/unless}}">
                <p class="scoring-model-description">
                    {{__ "The item awards different scores depending on how many correct responses are provided. Configure one or more thresholds with their corresponding scores."}}
                </p>
                <div class="scoring-model-levels">
                    <div class="scoring-model-levels-header">
                        <span class="scoring-level-threshold">{{__ "Correct responses"}}</span>
                        <span class="scoring-level-score">{{__ "Scores"}}</span>
                    </div>
                    <div class="scoring-model-level-list">
                        {{#each scoringLevels}}
                        {{> scoringModelLevel this}}
                        {{/each}}
                    </div>
                    <a href="#" class="action-link add-scoring-level-action" data-action="add-scoring-level">
                        <span class="icon-add"></span>{{__ "Add level"}}
                    </a>
                </div>
            </div>
        </div>
    </div>
</div>
