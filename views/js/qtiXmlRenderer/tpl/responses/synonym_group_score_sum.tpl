<setOutcomeValue identifier="{{scoreOutcome}}">
    <sum>
{{#each groupOutcomeIds}}
        <variable identifier="{{.}}" />
{{/each}}
    </sum>
</setOutcomeValue>
