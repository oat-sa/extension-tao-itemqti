<responseCondition>
    <responseIf>
        <{{condition}}>
            <variable identifier="{{scoreIdentifier}}" />
            <baseValue baseType="float">{{comparedValue}}</baseValue>
        </{{condition}}>
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