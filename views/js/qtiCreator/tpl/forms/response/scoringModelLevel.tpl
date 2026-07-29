<div class="scoring-model-level" data-level-index="{{index}}">
    <input type="text"
           class="score scoring-level-threshold"
           name="scoringLevelThreshold-{{index}}"
           value="{{threshold}}"
           data-increment="1"
           data-min="0"
           data-max="{{maxCorrectResponses}}"
           data-validate="$notEmpty; $numeric; $correctResponsesMax(max={{maxCorrectResponses}});"
           data-validate-option="$lazy; $event(type=keyup)" />
    <span class="scoring-level-suffix">{{__ "or more"}}</span>
    <input type="text"
           class="score scoring-level-score"
           name="scoringLevelScore-{{index}}"
           value="{{score}}"
           data-validate="$notEmpty; $numeric;"
           data-validate-option="$lazy; $event(type=keyup)" />
    <span class="trigger icon-bin scoring-level-remove"
          data-action="remove-scoring-level"
          title="{{__ 'Remove level'}}"></span>
</div>
