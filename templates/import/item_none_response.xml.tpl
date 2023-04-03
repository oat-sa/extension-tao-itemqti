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
    <responseDeclaration identifier="RESPONSE" cardinality="<?=get_data('responseDeclarationCardinality')?>" baseType="identifier"/>
    <itemBody>
        <div class="grid-row">
            <div class="col-12">
                <choiceInteraction responseIdentifier="RESPONSE" shuffle="<?=get_data('shuffle')?>" maxChoices="<?=get_data('maxChoices')?>" minChoices="<?=get_data('minChoices')?>" orientation="vertical">
                    <prompt><?=get_data('question')?></prompt>
                    <?php foreach(get_data('choices') as $choice):?>
                        <simpleChoice identifier="<?=$choice->getId()?>" fixed="false" showHide="show"><?=$choice->getChoice()?></simpleChoice>
                    <?php endforeach ?>
                </choiceInteraction>
            </div>
        </div>
    </itemBody>
</assessmentItem>
