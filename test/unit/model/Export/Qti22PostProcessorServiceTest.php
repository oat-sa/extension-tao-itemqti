<?php

namespace oat\taoQtiItem\test\unit\model\Export;

use oat\generis\test\TestCase;
use oat\taoQtiItem\model\Export\Qti22PostProcessorService;
use DOMDocument;

class Qti22PostProcessorServiceTest extends TestCase
{
    private Qti22PostProcessorService $service;
    private const QTI_NS = 'http://www.imsglobal.org/xsd/imsqtiv2p2_html5_v1p0';
    private const QH5_NS = 'http://www.imsglobal.org/xsd/imsqtiv2p2_html5_v1p0';

    public function setUp(): void
    {
        parent::setUp();
        $this->service = new Qti22PostProcessorService();
    }

    public function testItemContentPostProcessingRemovesSpecifiedAttributes(): void
    {
        $input = <<<XML
<?xml version="1.0" encoding="UTF-8"?>
<assessmentItem 
    xmlns="http://www.imsglobal.org/xsd/imsqtiv2p2_html5_v1p0"
    xmlns:qh5="http://www.imsglobal.org/xsd/imsqtiv2p2_html5_v1p0"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
    <itemBody>
        <img src="image.jpg" type="image/jpeg"/>
        <gapText fixed="true">Text</gapText>
        <gap fixed="false">Gap</gap>
        <gapImg fixed="true" src="gap.jpg"/>
        <associableHotspot fixed="true"/>
        <qh5:figure showFigure="true"/>
    </itemBody>
</assessmentItem>
XML;

        $result = $this->service->itemContentPostProcessing($input);
        
        $this->assertStringNotContainsString('type="image/jpeg"', $result);
        $this->assertStringNotContainsString('fixed="true"', $result);
        $this->assertStringNotContainsString('fixed="false"', $result);
        $this->assertStringNotContainsString('showFigure="true"', $result);
    }

    public function testItemContentPostProcessingUpdatesSchemaLocations(): void
    {
        $input = <<<XML
<?xml version="1.0" encoding="UTF-8"?>
<assessmentItem 
    xmlns="http://www.imsglobal.org/xsd/imsqtiv2p2_html5_v1p0"
    xmlns:qh5="http://www.imsglobal.org/xsd/imsqtiv2p2_html5_v1p0"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.imsglobal.org/xsd/imsqtiv2p2_html5_v1p0 old-schema.xsd">
    <itemBody>
        <math xmlns="http://www.w3.org/1998/Math/MathML">
            <mi>x</mi>
        </math>
    </itemBody>
</assessmentItem>
XML;

        $result = $this->service->itemContentPostProcessing($input);
        
        $this->assertStringContainsString(
            'https://purl.imsglobal.org/spec/qti/v2p2/schema/xsd/imsqtiv2p2p4_html5_v1p0.xsd',
            $result
        );
        $this->assertStringContainsString(
            'http://www.w3.org/Math/XMLSchema/mathml2/mathml2.xsd',
            $result
        );
    }

    public function testItemContentPostProcessingPreservesContent(): void
    {
        $input = <<<XML
<?xml version="1.0" encoding="UTF-8"?>
<assessmentItem 
    xmlns="http://www.imsglobal.org/xsd/imsqtiv2p2_html5_v1p0"
    xmlns:qh5="http://www.imsglobal.org/xsd/imsqtiv2p2_html5_v1p0"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
    <itemBody>
        <p>This is a test paragraph</p>
        <choiceInteraction>
            <simpleChoice>Option 1</simpleChoice>
            <simpleChoice>Option 2</simpleChoice>
        </choiceInteraction>
    </itemBody>
</assessmentItem>
XML;

        $result = $this->service->itemContentPostProcessing($input);
        
        $this->assertStringContainsString('<p>This is a test paragraph</p>', $result);
        $this->assertStringContainsString('<simpleChoice>Option 1</simpleChoice>', $result);
        $this->assertStringContainsString('<simpleChoice>Option 2</simpleChoice>', $result);
    }

    public function testItemContentPostProcessingHandlesEmptyInput(): void
    {
        $input = <<<XML
<?xml version="1.0" encoding="UTF-8"?>
<assessmentItem 
    xmlns="http://www.imsglobal.org/xsd/imsqtiv2p2_html5_v1p0"
    xmlns:qh5="http://www.imsglobal.org/xsd/imsqtiv2p2_html5_v1p0"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
    <itemBody>
    </itemBody>
</assessmentItem>
XML;

        $result = $this->service->itemContentPostProcessing($input);
        
        $this->assertNotEmpty($result);
        $this->assertStringContainsString('<itemBody>', $result);
    }
} 