<?php
declare(strict_types=1);
namespace oat\taoQtiItem\test\model\flyExporter\extractor;

use DOMDocument;
use DOMXPath;
use oat\taoQtiItem\model\flyExporter\extractor\QtiExtractor;
use PHPUnit\Framework\TestCase;
use ReflectionClass;

/**
 * Unit tests for the QtiExtractor class.
 *
 * @covers \oat\taoQtiItem\model\flyExporter\extractor\QtiExtractor
 */
class QtiExtractorTest extends TestCase
{
    private QtiExtractor $extractor;

    /**
     * A sample QTI XML for a simple choice interaction.
     */
    private const CHOICE_XML = <<<XML
    <assessmentItem xmlns="http://www.imsglobal.org/xsd/imsqti_v2p1" identifier="choice" timeDependent="false">
        <responseDeclaration identifier="RESPONSE" cardinality="single" baseType="identifier">
            <correctResponse>
                <value>c</value>
            </correctResponse>
        </responseDeclaration>
        <itemBody>
            <choiceInteraction responseIdentifier="RESPONSE" shuffle="true" maxChoices="1">
                <simpleChoice identifier="a">Apple</simpleChoice>
                <simpleChoice identifier="b">Banana</simpleChoice>
                <simpleChoice identifier="c">Carrot</simpleChoice>
            </choiceInteraction>
        </itemBody>
    </assessmentItem>
    XML;

    /**
     * A sample QTI XML with two interactions to test column equalization.
     * The first interaction has 2 choices, the second has 4.
     */
    private const MULTIPLE_CHOICE_INTERACTIONS_XML = <<<XML
    <assessmentItem xmlns="http://www.imsglobal.org/xsd/imsqti_v2p1" identifier="multi-choice" timeDependent="false">
        <responseDeclaration identifier="RESPONSE1" cardinality="single" baseType="identifier" />
        <responseDeclaration identifier="RESPONSE2" cardinality="single" baseType="identifier" />
        <itemBody>
            <choiceInteraction responseIdentifier="RESPONSE1" maxChoices="1">
                <simpleChoice identifier="a1">Choice A1</simpleChoice>
                <simpleChoice identifier="b1">Choice B1</simpleChoice>
            </choiceInteraction>
            <choiceInteraction responseIdentifier="RESPONSE2" maxChoices="1">
                <simpleChoice identifier="a2">Choice A2</simpleChoice>
                <simpleChoice identifier="b2">Choice B2</simpleChoice>
                <simpleChoice identifier="c2">Choice C2</simpleChoice>
                <simpleChoice identifier="d2">Choice D2</simpleChoice>
            </choiceInteraction>
        </itemBody>
    </assessmentItem>
    XML;

    /**
     * A sample QTI XML for a match interaction.
     */
    private const MATCH_XML = <<<XML
    <assessmentItem xmlns="http://www.imsglobal.org/xsd/imsqti_v2p1" identifier="match" timeDependent="false">
        <responseDeclaration identifier="RESPONSE" cardinality="multiple" baseType="directedPair">
            <correctResponse>
                <value>A 1</value>
                <value>B 2</value>
            </correctResponse>
        </responseDeclaration>
        <itemBody>
            <matchInteraction responseIdentifier="RESPONSE">
                <simpleMatchSet>
                    <simpleAssociableChoice identifier="A">Alpha</simpleAssociableChoice>
                    <simpleAssociableChoice identifier="B">Beta</simpleAssociableChoice>
                </simpleMatchSet>
                <simpleMatchSet>
                    <simpleAssociableChoice identifier="1">One</simpleAssociableChoice>
                    <simpleAssociableChoice identifier="2">Two</simpleAssociableChoice>
                </simpleMatchSet>
            </matchInteraction>
        </itemBody>
    </assessmentItem>
    XML;

    /**
     * A sample QTI XML for a custom PCI interaction.
     */
    private const CUSTOM_INTERACTION_XML = <<<XML
    <assessmentItem xmlns="http://www.imsglobal.org/xsd/imsqti_v2p1" 
    xmlns:pci="http://www.imsglobal.org/xsd/portableCustomInteraction" identifier="pci" timeDependent="false">
        <responseDeclaration identifier="RESPONSE" cardinality="single" baseType="string"/>
        <itemBody>
            <customInteraction responseIdentifier="RESPONSE">
                <pci:portableCustomInteraction customInteractionTypeIdentifier="myAwesomeInteraction" />
            </customInteraction>
        </itemBody>
    </assessmentItem>
    XML;


    protected function setUp(): void
    {
        $this->extractor = new QtiExtractor();
    }

    /**
     * Helper method to inject XML content directly into the extractor, bypassing the service dependency.
     */
    private function loadXmlIntoExtractor(string $xml): void
    {
        $dom = new DOMDocument();
        $dom->loadXML($xml);

        $xpath = new DOMXPath($dom);
        $namespace = $dom->documentElement->namespaceURI;
        if ($namespace) {
            $xpath->registerNamespace('qti', $namespace);
        }

        $reflection = new ReflectionClass($this->extractor);

        $domProperty = $reflection->getProperty('dom');
        $domProperty->setAccessible(true);
        $domProperty->setValue($this->extractor, $dom);

        $xpathProperty = $reflection->getProperty('xpath');
        $xpathProperty->setAccessible(true);
        $xpathProperty->setValue($this->extractor, $xpath);
    }

    // =======================================================================
    // == Main Logic Tests (using Reflection Helper)
    // =======================================================================

    public function testRunExtractsInteractionType(): void
    {
        $this->loadXmlIntoExtractor(self::CHOICE_XML);
        $this->extractor->addColumn('type', ['callback' => 'getInteractionType']);

        $data = $this->extractor->run()->getData();
        $this->assertCount(1, $data);

        $interactionData = array_shift($data);
        $this->assertSame('Choice', $interactionData['type']);
    }

    public function testRunExtractsCustomInteractionType(): void
    {
        $this->loadXmlIntoExtractor(self::CUSTOM_INTERACTION_XML);
        $this->extractor->addColumn('type', ['callback' => 'getInteractionType']);

        $data = $this->extractor->run()->getData();

        $this->assertCount(1, $data);
        $interactionData = array_shift($data);

        $this->assertSame('MyAwesome', $interactionData['type']);
    }

    public function testRunExtractsResponseIdentifier(): void
    {
        $this->loadXmlIntoExtractor(self::CHOICE_XML);
        $this->extractor->addColumn('id', ['callback' => 'getResponseIdentifier']);

        $data = $this->extractor->run()->getData();
        $interactionData = array_shift($data);

        $this->assertSame('RESPONSE', $interactionData['id']);
    }

    public function testRunExtractsNumberOfChoices(): void
    {
        $this->loadXmlIntoExtractor(self::CHOICE_XML);
        $this->extractor->addColumn('count', ['callback' => 'getNumberOfChoices']);

        $data = $this->extractor->run()->getData();
        $interactionData = array_shift($data);

        $this->assertSame(3, $interactionData['count']);
    }

    public function testRunExtractsRightAnswer(): void
    {
        $this->loadXmlIntoExtractor(self::CHOICE_XML);
        $this->extractor->addColumn('answer', ['callback' => 'getRightAnswer']);

        $data = $this->extractor->run()->getData();
        $interactionData = array_shift($data);

        $expected = [
            'BR_identifier' => 'c',
            'BR_label' => 'Carrot'
        ];

        $this->assertEquals($expected, $interactionData['answer']);
    }

    public function testRunExtractsRightAnswerForMatchInteractionWithCustomDelimiter(): void
    {
        $this->loadXmlIntoExtractor(self::MATCH_XML);
        $this->extractor->addColumn('answer', [
            'callback' => 'getRightAnswer',
            'callbackParameters' => ['delimiter' => '|']
        ]);

        $data = $this->extractor->run()->getData();
        $interactionData = array_shift($data);

        $expected = [
            'BR_identifier' => 'A 1|B 2',
            'BR_label' => 'Alpha One|Beta Two'
        ];

        $this->assertEquals($expected, $interactionData['answer']);
    }

    public function testRunExtractsChoicesAsDynamicColumns(): void
    {
        $this->loadXmlIntoExtractor(self::CHOICE_XML);
        $this->extractor->addColumn('choices', [
            'callback' => 'getChoices',
            'valuesAsColumns' => true
        ]);

        $data = $this->extractor->run()->getData();
        $interactionData = array_shift($data);

        $expected = [
            'choice_identifier_1' => 'a',
            'choice_label_1' => 'Apple',
            'choice_identifier_2' => 'b',
            'choice_label_2' => 'Banana',
            'choice_identifier_3' => 'c',
            'choice_label_3' => 'Carrot',
        ];

        $this->assertEquals($expected, $interactionData);
    }

    public function testRunEqualizesColumnsForMultipleInteractions(): void
    {
        $this->loadXmlIntoExtractor(self::MULTIPLE_CHOICE_INTERACTIONS_XML);
        $this->extractor->addColumn('choices', [
            'callback' => 'getChoices',
            'valuesAsColumns' => true
        ]);

        $data = $this->extractor->run()->getData();
        $interactions = array_values($data);

        $this->assertCount(2, $interactions);

        // Both interactions should have columns up to the max (4)
        $this->assertArrayHasKey('choice_identifier_4', $interactions[0]);
        $this->assertArrayHasKey('choice_label_4', $interactions[0]);
        $this->assertArrayHasKey('choice_identifier_4', $interactions[1]);
        $this->assertArrayHasKey('choice_label_4', $interactions[1]);

        // The first interaction (with only 2 choices) should have empty strings for the extra columns
        $this->assertSame('b1', $interactions[0]['choice_identifier_2']);
        $this->assertSame('', $interactions[0]['choice_identifier_3']);
        $this->assertSame('', $interactions[0]['choice_label_3']);
        $this->assertSame('', $interactions[0]['choice_identifier_4']);
        $this->assertSame('', $interactions[0]['choice_label_4']);

        // The second interaction should have its data intact
        $this->assertSame('d2', $interactions[1]['choice_identifier_4']);
        $this->assertSame('Choice D2', $interactions[1]['choice_label_4']);
    }

    public function testRunIgnoresColumnsWithInvalidCallbacks(): void
    {
        $this->loadXmlIntoExtractor(self::CHOICE_XML);

        $this->extractor
            ->addColumn('valid', ['callback' => 'getInteractionType'])
            ->addColumn('invalid', ['callback' => 'nonExistentMethod'])
            ->addColumn('missing', ['config_key' => 'value']); // no callback key

        $data = $this->extractor->run()->getData();
        $interactionData = array_shift($data);

        $this->assertArrayHasKey('valid', $interactionData);
        $this->assertArrayNotHasKey('invalid', $interactionData);
        $this->assertArrayNotHasKey('missing', $interactionData);
        $this->assertSame('Choice', $interactionData['valid']);
    }

    public function testGetDataReturnsEmptyArrayBeforeRun(): void
    {
        $this->assertEmpty($this->extractor->getData());
    }

    /**
     * @dataProvider sanitizeNodeProvider
     */
    public function testSanitizeNodeToValue(string $input, string $expected): void
    {
        $reflectionMethod = new ReflectionClass(QtiExtractor::class);
        $method = $reflectionMethod->getMethod('sanitizeNodeToValue');
        $method->setAccessible(true);

        $result = $method->invoke($this->extractor, $input);

        $this->assertSame($expected, $result);
    }

    public static function sanitizeNodeProvider(): array
    {
        return [
            'simple tag' => ['<p>Hello World</p>', 'Hello World'],
            'tag with attributes' => ['<div class="foo">Trimmed</div>', 'Trimmed'],
            'nested tags' => ['<li>Some <b>bold</b> text</li>', 'Some <b>bold</b> text'],
            'string with quotes' => ['<option>He said "Hi!"</option>', 'He said ""Hi!""'],
            'empty tag' => ['<p></p>', ''],
        ];
    }
}
