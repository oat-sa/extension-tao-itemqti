<responseCondition>
    <responseIf>
        <match>
            <variable identifier="{{response}}" />
            <multiple>
                {{#each choices}}
                <baseValue baseType="identifier">{{.}}</baseValue>
                {{/each}}
            </multiple>    
        </match>
        <setOutcomeValue identifier="{{feedback.outcome}}">
            <baseValue baseType="identifier">{{feedback.then}}</baseValue>
        </setOutcomeValue>
    </responseIf>
    {{~#if feedback.else}}
    <responseElse>
        <setOutcomeValue identifier="{{feedback.outcome}}">
            <baseValue baseType="identifier">{{feedback.else}}</baseValue>
        </setOutcomeValue>
    </responseElse>
    {{~/if}}
</responseCondition>