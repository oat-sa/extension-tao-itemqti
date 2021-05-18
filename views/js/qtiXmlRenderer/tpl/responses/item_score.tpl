<setOutcomeValue identifier="{{identifier}}">
    <sum>
        {{#each outcomeIdentifiers}}
            <variable identifier="{{.}}" />
        {{/each}}
    </sum>
</setOutcomeValue>
