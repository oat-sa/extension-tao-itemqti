<?='<?xml version="1.0" encoding="UTF-8"?>'?>
<assessmentItem
    xmlns="http://www.imsglobal.org/xsd/imsqti_v2p2"
    xmlns:m="http://www.w3.org/1998/Math/MathML"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.imsglobal.org/xsd/imsqti_v2p2 http://www.imsglobal.org/xsd/qti/qtiv2p2/imsqti_v2p2.xsd" identifier="i6011423ba1e83975c19a3f96e48f662"
    title="<?=get_data('name')?>"
    label="<?=get_data('name')?>"
    xml:lang="<?=get_data('language')?>"
    adaptive="false"
    timeDependent="false"
    toolName="TAO"
    toolVersion="3.4.0-sprint146">
    <responseDeclaration identifier="RESPONSE" cardinality="multiple" baseType="identifier">
        <?if(get_data('isMatchCorrectResponse')):?>
            <?foreach(get_data('choices') as $choice):?>
                <?if($choice->isCorrect()):?>
                <correctResponse>
                    <value><![CDATA[<?=$choice->getId()?>]]></value>
                </correctResponse>
                <?endif?>
            <?endforeach?>
        <?endif?>
        <?if(get_data('isMapResponse')):?>
            <mapping defaultValue="0">
                <?foreach(get_data('choices') as $choice):?>
                    <mapEntry mapKey="<?=$choice->getId()?>" mappedValue="<?=_dh($choice->getChoiceScore())?>"/>
                <?endforeach?>
            </mapping>
        <?endif?>
    </responseDeclaration>
    <?if(get_data('isMatchCorrectResponse')):?>
        <outcomeDeclaration cardinality="single" baseType="float" identifier="SCORE_RESPONSE"/>
    <?endif?>
    <?if(get_data('isMatchCorrectResponse') || get_data('isMapResponse')):?>
        <outcomeDeclaration identifier="SCORE" cardinality="single" baseType="float" />
        <outcomeDeclaration identifier="MAXSCORE" cardinality="single" baseType="float">
            <defaultValue>
                <value><?=get_data('maxScore')?></value>
            </defaultValue>
        </outcomeDeclaration>
    <?endif?>
    <stylesheet href="style/custom/tao-user-styles.css" type="text/css" media="all" title=""/>
    <itemBody>
        <div class="grid-row">
            <div class="col-12">
                <choiceInteraction responseIdentifier="RESPONSE" shuffle="<?=get_data('shuffle')?>" maxChoices="<?=get_data('maxChoices')?>" minChoices="<?=get_data('minChoices')?>" orientation="vertical">
                    <prompt><?=get_data('question')?></prompt>
                    <?foreach(get_data('choices') as $choice):?>
                        <simpleChoice identifier="<?=$choice->getId()?>" fixed="false" showHide="show"><?=_dh($choice->getChoice())?></simpleChoice>
                    <?endforeach?>
                </choiceInteraction>
            </div>
        </div>
    </itemBody>
    <!--
    ************************************************************
    * Match Correct Response processing
    ************************************************************
    -->
    <?if(get_data('isMatchCorrectResponse')):?>
        <responseProcessing>
            <responseCondition>
                <responseIf>
                    <match>
                        <variable identifier="RESPONSE"/>
                        <correct identifier="RESPONSE"/>
                    </match>
                    <setOutcomeValue identifier="SCORE_RESPONSE">
                        <sum>
                            <variable identifier="SCORE_RESPONSE"/>
                            <baseValue baseType="integer">1</baseValue>
                        </sum>
                    </setOutcomeValue>
                </responseIf>
            </responseCondition>
            <setOutcomeValue identifier="SCORE">
                <sum>
                    <variable identifier="SCORE_RESPONSE"/>
                </sum>
            </setOutcomeValue>
        </responseProcessing>
    <?endif?>
</assessmentItem>
