<responseCondition>
    <responseIf>
        <or>
{{#each matches}}
            <stringMatch caseSensitive="{{caseSensitive}}">
                <variable identifier="{{responseIdentifier}}" />
                <baseValue baseType="string">{{synonym}}</baseValue>
            </stringMatch>
{{/each}}
        </or>
        <setOutcomeValue identifier="{{outcomeId}}">
            <baseValue baseType="integer">{{maxScore}}</baseValue>
        </setOutcomeValue>
    </responseIf>
</responseCondition>
