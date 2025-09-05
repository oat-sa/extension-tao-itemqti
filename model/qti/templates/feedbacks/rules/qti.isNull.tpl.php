<responseCondition>
    <responseIf>
        <isNull>
            <variable identifier="<?=$responseIdentifier?>" />
        </isNull>
        <setOutcomeValue identifier="<?=$feedbackOutcomeIdentifier?>">
            <baseValue baseType="identifier"><?=$feedbackIdentifierThen?></baseValue>
        </setOutcomeValue>
    </responseIf>
</responseCondition>