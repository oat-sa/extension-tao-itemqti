<?php

/*
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; under version 2
 * of the License (non-upgradable).
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 31 Milk St # 960789 Boston, MA 02196 USA.
 *
 * Copyright (c) 2025-2026 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiItem\test\unit\model\qti;

use common_ext_Extension;
use common_ext_ExtensionsManager;
use DOMDocument;
use League\Flysystem\FilesystemException;
use League\Flysystem\Local\LocalFilesystemAdapter;
use oat\oatbox\service\ServiceManager;
use oat\generis\test\ServiceManagerMockTrait;
use oat\tao\model\service\ApplicationService;
use oat\taoQtiItem\model\qti\exception\UnexpectedResponseProcessing;
use oat\taoQtiItem\model\qti\feedback\ModalFeedback;
use oat\taoQtiItem\model\qti\FigCaption;
use oat\taoQtiItem\model\qti\Figure;
use oat\taoQtiItem\model\qti\Item;
use oat\taoQtiItem\model\qti\OutcomeDeclaration;
use oat\taoQtiItem\model\qti\ParserFactory;
use oat\taoQtiItem\model\qti\response\TemplatesDriven;
use oat\taoQtiItem\model\qti\ResponseDeclaration;
use PHPUnit\Framework\TestCase;
use Psr\Log\LoggerInterface;
use League\Flysystem\Filesystem;
use ReflectionClass;

class ParserFactoryTest extends TestCase
{
    use ServiceManagerMockTrait;

    private const PRODUCT_NAME = 'TAO';

    private LoggerInterface $logger;

    protected function setUp(): void
    {
        parent::setUp();

        if (!defined('PRODUCT_NAME')) {
            define('PRODUCT_NAME', self::PRODUCT_NAME);
        }

        $this->logger = $this->createMock(LoggerInterface::class);

        $commonExtensionMock = $this->createMock(common_ext_Extension::class);
        $commonExtensionMock
            ->method('getDir')
            ->willReturn(ROOT_PATH . DIRECTORY_SEPARATOR . 'taoQtiItem' . DIRECTORY_SEPARATOR);

        $extensionsManagerMock = $this->createMock(common_ext_ExtensionsManager::class);
        $extensionsManagerMock
            ->method('getExtensionById')
            ->willReturn($commonExtensionMock);

        $applicationServiceMock = $this->createMock(ApplicationService::class);

        $sm = $this->getServiceManagerMock(
            [
                ApplicationService::SERVICE_ID => $applicationServiceMock,
                common_ext_ExtensionsManager::class => $extensionsManagerMock
            ]
        );

        ServiceManager::setServiceManager($sm);
    }

    public function testParseItem(): void
    {
        $itemDocument = $this->readSampleFile('testParseItem_itemDocument.xml');
        $dom = new DOMDocument();
        $dom->loadXML($itemDocument);

        $parser = new ParserFactory($dom);

        $this->logger->expects($this->once())->method('debug')
            ->with('Started parsing of QTI item i61dbf0028b0ca4904497f514befea47f', ['TAOITEMS']);
        $parser->setLogger($this->logger);

        $item = $parser->load();

        self::assertInstanceOf(Item::class, $item);
        self::assertEquals([], $item->getBody()->getAttributeValues());
        self::assertEquals(
            '
        <div class="grid-row">
            <div class="col-12">
                <p>Lorem ipsum dolor sit amet, consectetur adipisicing ...</p>
            </div>
        </div>
    ',
            $item->getBody()->getBody()
        );
    }

    /**
     * @return                   array
     * @doesNotPerformAssertions
     */
    public function testParseItemWithScoreBasedFeedbackRuleProvider(): array
    {
        $conditions = ['lt', 'gt', 'equal', 'lte', 'gte'];

        $data = [];

        foreach ($conditions as $condition) {
            $data[] = [
                $this->getParseItemWithScoreXml($condition), $condition
            ];
        }

        return $data;
    }

    /**
     * @return                   array
     * @doesNotPerformAssertions
     */
    public function testParseItemWithIsNullFeedbackRuleProvider(): array
    {
        $data = [
            [$this->getParseItemWithIsNullXml()]
        ];

        return $data;
    }

    /**
     * @return                   array
     * @doesNotPerformAssertions
     */
    public function testParseItemWithScoreBasedFeedbackRuleProviderBadConditions(): array
    {
        $conditions = ['notequal', 'equals'];

        $data = [];

        foreach ($conditions as $condition) {
            $data[] = [
                $this->getParseItemWithScoreXml($condition)
            ];
        }

        return $data;
    }

    /**
     * @dataProvider testParseItemWithScoreBasedFeedbackRuleProvider
     */
    public function testParseItemWithScoreBasedFeedbackRule(string $xml, string $condition): void
    {
        [$parser, $method, $element] = $this->getParseItemWithScoreParser($xml);

        $response = $method->invokeArgs($parser, [$element, []]);

        $this->assertInstanceOf(TemplatesDriven::class, $response);
        $this->assertTrue($parser->test_isCalled_buildScoreFeedbackRule);
        $this->assertEquals($condition, $parser->test_conditionName);
    }

    /**
     * @return void
     * @dataProvider testParseItemWithIsNullFeedbackRuleProvider
     */
    public function testParseItemWithIsNullFeedbackRule(string $xml): void
    {
        [$parser, $method, $xmlElement] = $this->getParseItemWithIsNullParser($xml);

        $response = $method->invokeArgs($parser, [$xmlElement, []]);

        $this->assertInstanceOf(TemplatesDriven::class, $response);
        $this->assertTrue($parser->test_isCalled_buildIsNullFeedbackRule);
    }

    /**
     * @dataProvider testParseItemWithScoreBasedFeedbackRuleProviderBadConditions
     */
    public function testParseItemWithScoreBasedFeedbackRuleBadConditions(string $xml): void
    {
        [$parser, $method, $xmlElement] = $this->getParseItemWithScoreParser($xml);

        $this->expectException(UnexpectedResponseProcessing::class);

        $method->invokeArgs($parser, [$xmlElement, []]);
    }

    public function testParseItemWithDirAttributeOnItemBody(): void
    {
        $itemDocument = $this->readSampleFile('testParseItemWithDirAttributeOnItemBody_itemDocument.xml');

        $dom = new DOMDocument();
        $dom->loadXML($itemDocument);

        $parser = new ParserFactory($dom);

        $this->logger->expects($this->once())
            ->method('debug')
            ->with('Started parsing of QTI item i61dbf0028b0ca4904497f514befea47f', ['TAOITEMS']);
        $parser->setLogger($this->logger);
        $item = $parser->load();

        self::assertInstanceOf(Item::class, $item);
        self::assertEquals(['dir' => 'rtl'], $item->getBody()->getAttributeValues());
        self::assertEquals(
            '
        <div class="grid-row">
            <div class="col-12">
                <p>Lorem ipsum dolor sit amet, consectetur adipisicing ...</p>
            </div>
        </div>
    ',
            $item->getBody()->getBody()
        );
    }

    /**
     * @dataProvider figureProvider
     */
    public function testParseItemWithFigureAndFigcaption(string $sampleFile): void
    {
        $itemDocument = $this->readSampleFile($sampleFile);
        $dom = new DOMDocument();
        $dom->loadXML($itemDocument);

        $parser = new ParserFactory($dom);
        $item = $parser->load();

        $figures = $item->getBody()->getElements(Figure::class);
        self::assertCount(1, $figures);
        $figure = reset($figures);
        self::assertInstanceOf(Figure::class, $figure);

        $figCaptions = $figure->getBody()->getElements(FigCaption::class);
        self::assertCount(1, $figCaptions);
    }

    public function figureProvider(): array
    {
        return [
            ['testParseItemWithFigureWithNamespace_itemDocument.xml'],
        ];
    }

    /**
     * @param  string $name
     * @return string
     * @throws FilesystemException
     */
    private function readSampleFile(string $name): string
    {
        $adapter = new LocalFilesystemAdapter(
            dirname(__DIR__, 2) . '/samples/model/qti/parserFactory'
        );

        $filesystem = new Filesystem($adapter);

        return $filesystem->read($name);
    }

    private function getParseItemWithIsNullXml()
    {
        $xml =
            <<<XML
<responseProcessing>
    <responseCondition>
    <responseIf>
        <isNull>
            <variable identifier="RESPONSE" />
        </isNull>
        <setOutcomeValue identifier="FEEDBACK_1">
            <baseValue baseType="identifier">feedbackModal_1</baseValue>
        </setOutcomeValue>
    </responseIf>
</responseCondition>
</responseProcessing>
XML;
        return "<root>" . $xml . "</root>";
    }

    private function getParseItemWithScoreXml(string $condition): string
    {
        $xml = <<<XML
<responseProcessing>
    <responseCondition>
        <responseIf>
            <and>
                <not>
                    <isNull>
                        <variable identifier="RESPONSE"/>
                    </isNull>
                </not>
                <$condition>
                    <variable identifier="SCORE" />
                    <baseValue baseType="float">2</baseValue>
                </$condition>
            </and>
            <setOutcomeValue identifier="FEEDBACK_1">
                <baseValue baseType="identifier">feedbackModal_1</baseValue>
            </setOutcomeValue>
        </responseIf>
    </responseCondition>
</responseProcessing>
XML;
        return "<root>" . $xml . "</root>";
    }

    private function getParseItemWithIsNullParser(string $xml)
    {
        $itemDocument = $this->readSampleFile('testParseItem_itemDocument.xml');
        $dom = new DOMDocument();
        $dom->loadXML($itemDocument);

        $parser = new class ($dom) extends ParserFactory {
            public $test_isCalled_buildIsNullFeedbackRule = false;
            protected function getResponse($itentifier)
            {
                return new ResponseDeclaration();
            }

            protected function getOutcome($identifier)
            {
                return new OutcomeDeclaration();
            }

            protected function getModalFeedback($itemtifier)
            {
                return new ModalFeedback();
            }
            protected function buildIsNullFeedbackRule($subtree, $comparedValue = null, $responseId = '')
            {
                $this->test_isCalled_buildIsNullFeedbackRule = true;
                return parent::buildIsNullFeedbackRule($subtree, $comparedValue, $responseId);
            }
        };

        $parser->load();

        $dom = new DOMDocument('1.0', 'UTF-8');
        $dom->loadXML($xml);


        $reflection = new ReflectionClass($parser);

        $method = $reflection->getMethod('buildTemplatedrivenResponse');
        $method->setAccessible(true);

        return [$parser, $method, $dom->documentElement->firstChild];
    }

    private function getParseItemWithScoreParser(string $xml)
    {
        $itemDocument = $this->readSampleFile('testParseItem_itemDocument.xml');
        $dom = new DOMDocument();
        $dom->loadXML($itemDocument);

        $parser = new class ($dom) extends ParserFactory {
            public $test_conditionName = null;

            public $test_isCalled_buildScoreFeedbackRule = false;
            protected function getResponse($itentifier)
            {
                return new ResponseDeclaration();
            }

            protected function getOutcome($identifier)
            {
                return new OutcomeDeclaration();
            }

            protected function getModalFeedback($itemtifier)
            {
                return new ModalFeedback();
            }

            protected function buildScoreFeedbackRule(
                $subtree,
                $conditionName,
                $comparedValue,
                $responseIdentifier,
                $xml
            ) {
                $this->test_conditionName = $conditionName;
                $this->test_isCalled_buildScoreFeedbackRule = true;
                return parent::buildScoreFeedbackRule(
                    $subtree,
                    $conditionName,
                    $comparedValue,
                    $responseIdentifier,
                    $xml
                );
            }
        };

        $parser->load();

        $dom = new DOMDocument('1.0', 'UTF-8');
        $dom->loadXML($xml);


        $reflection = new ReflectionClass($parser);

        $method = $reflection->getMethod('buildTemplatedrivenResponse');
        $method->setAccessible(true);

        return [$parser, $method, $dom->documentElement->firstChild];
    }

    public function testParseGapMatchWithMathInGapTextAndGapsInTable(): void
    {
        $item = $this->parseXml($this->gapMatchMathXml());

        $interactions = $item->getInteractions();
        self::assertCount(1, $interactions);
        $interaction = reset($interactions);

        // gaps laid out in the table remain fillable elements of the interaction
        self::assertCount(2, $interaction->getBody()->getElements(\oat\taoQtiItem\model\qti\choice\Gap::class));

        $choices = $interaction->getChoices();
        self::assertCount(2, $choices);
        foreach ($choices as $choice) {
            self::assertNotEmpty(
                $choice->getBody()->getElements(\oat\taoQtiItem\model\qti\Math::class),
                'gapText choice should contain a Math element'
            );
        }

        $qti = $item->toQTI();
        self::assertStringContainsString('<table>', $qti);
        self::assertMatchesRegularExpression('/<gap\s+identifier="gapA"/', $qti);
        self::assertStringContainsString('m:math', $qti);
    }

    public function testParseInlineChoiceWithMath(): void
    {
        $item = $this->parseXml($this->inlineChoiceMathXml());

        $interactions = $item->getInteractions();
        self::assertCount(1, $interactions);
        $interaction = reset($interactions);

        $choices = $interaction->getChoices();
        self::assertCount(2, $choices);
        foreach ($choices as $choice) {
            self::assertNotEmpty(
                $choice->getBody()->getElements(\oat\taoQtiItem\model\qti\Math::class),
                'inlineChoice should contain a Math element'
            );
        }

        self::assertStringContainsString('m:math', $item->toQTI());
    }

    public function testParseQti3GapMatchWithMathAndTableAfterConversion(): void
    {
        $tmp = tempnam(sys_get_temp_dir(), 'qti3_') . '.xml';
        file_put_contents($tmp, $this->gapMatchMathQti3Xml());

        try {
            $converter = new \oat\taoQtiItem\model\qti\converter\ItemConverter(
                new \oat\taoQtiItem\model\qti\converter\CaseConversionService(),
                new \oat\taoQtiItem\model\ValidationService()
            );
            $converter->convertToQti2($tmp);

            $item = $this->parseXml(file_get_contents($tmp));
            $interactions = $item->getInteractions();
            $interaction = reset($interactions);
            self::assertCount(2, $interaction->getBody()->getElements(\oat\taoQtiItem\model\qti\choice\Gap::class));
            self::assertStringContainsString('m:math', $item->toQTI());
            self::assertStringContainsString('<table>', $item->toQTI());
        } finally {
            unlink($tmp);
        }
    }

    public function testGapMatchMathExportValidatesAgainstQti22Xsd(): void
    {
        $item = $this->parseXml($this->gapMatchMathXml());
        $xml = (new \oat\taoQtiItem\model\Export\Qti22PostProcessorService())
            ->itemContentPostProcessing($item->toQTI());

        $dom = new DOMDocument();
        $dom->loadXML($xml);
        $xsd = dirname(__DIR__, 4) . '/model/qti/data/qtiv2p2p4/imsqti_v2p2p4.xsd';
        libxml_use_internal_errors(true);
        libxml_clear_errors();
        $valid = $dom->schemaValidate($xsd);
        $errors = array_map(static fn ($e) => trim($e->message), libxml_get_errors());
        self::assertTrue($valid, implode(' | ', $errors));
        self::assertStringContainsString('math', $xml);
    }

    private function parseXml(string $xml): Item
    {
        $dom = new DOMDocument();
        $dom->loadXML($xml);
        $parser = new ParserFactory($dom);
        $parser->setLogger($this->logger);
        return $parser->load();
    }

    private function gapMatchMathXml(): string
    {
        return <<<'XML'
<?xml version="1.0" encoding="UTF-8"?>
<assessmentItem xmlns="http://www.imsglobal.org/xsd/imsqti_v2p2"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:m="http://www.w3.org/2010/Math/MathML"
    xsi:schemaLocation="http://www.imsglobal.org/xsd/imsqti_v2p2 http://www.imsglobal.org/xsd/qti/qtiv2p2/imsqti_v2p2.xsd"
    identifier="nonref-gap-match" title="Non-reference Gap Match" adaptive="false" timeDependent="false">
  <responseDeclaration identifier="RESPONSE" cardinality="multiple" baseType="directedPair">
    <correctResponse><value>txtA gapA</value><value>txtB gapB</value></correctResponse>
  </responseDeclaration>
  <outcomeDeclaration identifier="SCORE" cardinality="single" baseType="float"/>
  <itemBody>
    <p>Classify each expression.</p>
    <gapMatchInteraction responseIdentifier="RESPONSE" maxAssociations="2">
      <gapText identifier="txtA" matchMax="1"><m:math><m:mfrac><m:mi>x</m:mi><m:mn>2</m:mn></m:mfrac></m:math></gapText>
      <gapText identifier="txtB" matchMax="1">plain <m:math><m:msup><m:mi>y</m:mi><m:mn>3</m:mn></m:msup></m:math></gapText>
      <div><table><tbody>
        <tr><td><p><gap identifier="gapA"/></p></td><td><p><gap identifier="gapB"/></p></td></tr>
      </tbody></table></div>
    </gapMatchInteraction>
  </itemBody>
  <responseProcessing template="http://www.imsglobal.org/question/qti_v2p2/rptemplates/match_correct"/>
</assessmentItem>
XML;
    }

    private function gapMatchMathQti3Xml(): string
    {
        return <<<'XML'
<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.imsglobal.org/xsd/imsqtiasi_v3p0 https://purl.imsglobal.org/spec/qti/v3p0/schema/xsd/imsqti_asiv3p0_v1p0.xsd"
    identifier="nonref-gap-match-3" title="Non-reference Gap Match 3" adaptive="false" time-dependent="false">
  <qti-response-declaration identifier="RESPONSE" cardinality="multiple" base-type="directedPair">
    <qti-correct-response><qti-value>txtA gapA</qti-value><qti-value>txtB gapB</qti-value></qti-correct-response>
  </qti-response-declaration>
  <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float"/>
  <qti-item-body>
    <p>Classify each expression.</p>
    <qti-gap-match-interaction response-identifier="RESPONSE" max-associations="2">
      <qti-gap-text identifier="txtA" match-max="1"><math xmlns="http://www.w3.org/1998/Math/MathML" alttext="x over 2"><mfrac><mi>x</mi><mn>2</mn></mfrac></math></qti-gap-text>
      <qti-gap-text identifier="txtB" match-max="1"><math xmlns="http://www.w3.org/1998/Math/MathML"><msup><mi>y</mi><mn>3</mn></msup></math></qti-gap-text>
      <div><table><tbody>
        <tr><td><p><qti-gap identifier="gapA"/></p></td><td><p><qti-gap identifier="gapB"/></p></td></tr>
      </tbody></table></div>
    </qti-gap-match-interaction>
  </qti-item-body>
  <qti-response-processing template="https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/match_correct.xml"/>
</qti-assessment-item>
XML;
    }

    private function inlineChoiceMathXml(): string
    {
        return <<<'XML'
<?xml version="1.0" encoding="UTF-8"?>
<assessmentItem xmlns="http://www.imsglobal.org/xsd/imsqti_v2p2"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:m="http://www.w3.org/2010/Math/MathML"
    xsi:schemaLocation="http://www.imsglobal.org/xsd/imsqti_v2p2 http://www.imsglobal.org/xsd/qti/qtiv2p2/imsqti_v2p2.xsd"
    identifier="nonref-inline-choice" title="Non-reference Inline Choice" adaptive="false" timeDependent="false">
  <responseDeclaration identifier="RESPONSE" cardinality="single" baseType="identifier">
    <correctResponse><value>optB</value></correctResponse>
  </responseDeclaration>
  <outcomeDeclaration identifier="SCORE" cardinality="single" baseType="float"/>
  <itemBody>
    <p>Pick: <inlineChoiceInteraction responseIdentifier="RESPONSE">
      <inlineChoice identifier="optA"><m:math><m:mrow><m:mi>p</m:mi><m:mo>+</m:mo><m:mn>1</m:mn></m:mrow></m:math></inlineChoice>
      <inlineChoice identifier="optB">value <m:math><m:mrow><m:mi>p</m:mi><m:mo>-</m:mo><m:mn>1</m:mn></m:mrow></m:math></inlineChoice>
    </inlineChoiceInteraction></p>
  </itemBody>
  <responseProcessing template="http://www.imsglobal.org/question/qti_v2p2/rptemplates/match_correct"/>
</assessmentItem>
XML;
    }

    public function testFindNamespaceWithXIncludeOnlyInSchemaLocationIsCached(): void
    {
        $choices = '';
        for ($i = 0; $i < 40; $i++) {
            $choices .= sprintf(
                '<simpleChoice identifier="choice_%d">Label %d</simpleChoice>',
                $i,
                $i
            );
        }

        $xml = <<<XML
<?xml version="1.0" encoding="UTF-8"?>
<assessmentItem
        xmlns="http://www.imsglobal.org/xsd/imsqti_v2p2"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.imsglobal.org/xsd/imsqti_v2p2
            http://www.imsglobal.org/xsd/qti/qtiv2p2/imsqti_v2p2.xsd
            http://www.w3.org/2001/XInclude
            https://www.imsglobal.org/xsd/w3/2001/XInclude.xsd"
        identifier="ns_lookup_no_xi"
        title="Namespace lookup without xi"
        adaptive="false"
        timeDependent="false">
    <responseDeclaration identifier="RESPONSE" cardinality="single" baseType="identifier"/>
    <outcomeDeclaration identifier="SCORE" cardinality="single" baseType="float"/>
    <itemBody>
        <choiceInteraction responseIdentifier="RESPONSE" shuffle="false" maxChoices="1">
            {$choices}
        </choiceInteraction>
    </itemBody>
</assessmentItem>
XML;

        $dom = new DOMDocument();
        $dom->loadXML($xml);

        $parser = new ParserFactory($dom);
        $this->logger->expects($this->atLeastOnce())->method('debug');
        $parser->setLogger($this->logger);

        $item = $parser->load();
        self::assertInstanceOf(Item::class, $item);

        $method = (new ReflectionClass($parser))->getMethod('findNamespace');
        $method->setAccessible(true);

        $started = hrtime(true);
        for ($i = 0; $i < 500; $i++) {
            self::assertSame('', $method->invoke($parser, 'XInclude'));
        }
        $elapsedMs = (hrtime(true) - $started) / 1e6;

        self::assertLessThan(
            200.0,
            $elapsedMs,
            sprintf('findNamespace took %.1f ms for 500 cached lookups', $elapsedMs)
        );
    }

    public function testFindNamespaceReturnsXiPrefixWhenDeclared(): void
    {
        $xml = <<<'XML'
<?xml version="1.0" encoding="UTF-8"?>
<assessmentItem
        xmlns="http://www.imsglobal.org/xsd/imsqti_v2p2"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xmlns:xi="http://www.w3.org/2001/XInclude"
        xsi:schemaLocation="http://www.imsglobal.org/xsd/imsqti_v2p2
            http://www.imsglobal.org/xsd/qti/qtiv2p2/imsqti_v2p2.xsd
            http://www.w3.org/2001/XInclude
            https://www.imsglobal.org/xsd/w3/2001/XInclude.xsd"
        identifier="ns_lookup_with_xi"
        title="Namespace lookup with xi"
        adaptive="false"
        timeDependent="false">
    <itemBody>
        <div><p>ok</p></div>
    </itemBody>
</assessmentItem>
XML;

        $dom = new DOMDocument();
        $dom->loadXML($xml);

        $parser = new ParserFactory($dom);
        $this->logger->expects($this->atLeastOnce())->method('debug');
        $parser->setLogger($this->logger);
        $parser->load();

        $method = (new ReflectionClass($parser))->getMethod('findNamespace');
        $method->setAccessible(true);

        self::assertSame('xi', $method->invoke($parser, 'XInclude'));
        self::assertSame('xi', $method->invoke($parser, 'XInclude'));
    }
}
