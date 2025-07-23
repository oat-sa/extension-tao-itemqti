<responseCondition>
    <responseIf>
        <and>
            <not>
                <isNull>
                    <variable identifier="{{response}}"/>
                </isNull>
            </not>
            <{{condition}}>
                <variable identifier="{{scoreIdentifier}}" />
                <baseValue baseType="float">{{comparedValue}}</baseValue>
            </{{condition}}>
        </and>
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