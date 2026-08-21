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
 * Copyright (c) 2026 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiItem\test\unit\model\qti;

use common_ext_Extension;
use common_ext_ExtensionsManager;
use oat\generis\test\ServiceManagerMockTrait;
use oat\oatbox\service\ServiceManager;
use oat\tao\model\service\ApplicationService;
use oat\taoQtiItem\model\qti\ImportService;
use oat\taoQtiItem\model\qti\Item;
use oat\taoQtiItem\model\qti\interaction\MatchInteraction;
use PHPUnit\Framework\TestCase;
use ReflectionMethod;

class ImportServiceMatchInteractionModeTest extends TestCase
{
    use ServiceManagerMockTrait;

    private ImportService $subject;

    protected function setUp(): void
    {
        parent::setUp();

        if (!defined('PRODUCT_NAME')) {
            define('PRODUCT_NAME', 'TAO');
        }

        $extensionMock = $this->createMock(common_ext_Extension::class);
        $extensionsManagerMock = $this->createMock(common_ext_ExtensionsManager::class);
        $extensionsManagerMock
            ->method('getExtensionById')
            ->willReturn($extensionMock);

        $serviceManager = $this->getServiceManagerMock(
            [
                common_ext_ExtensionsManager::class => $extensionsManagerMock,
                ApplicationService::SERVICE_ID => $this->createMock(ApplicationService::class),
            ]
        );

        ServiceManager::setServiceManager($serviceManager);

        $this->subject = new ImportService();
        $this->subject->setServiceManager($serviceManager);
    }

    public function testImportedMatchInteractionWithoutModeGetsNonTabularClass(): void
    {
        $interaction = $this->importFirstMatchInteraction($this->getMatchItemXml(''));

        $this->assertSame('qti-match-non-tabular', $interaction->getAttributeValue('class'));
    }

    public function testImportedMatchInteractionKeepsItsExplicitMode(): void
    {
        $interaction = $this->importFirstMatchInteraction($this->getMatchItemXml(' class="qti-match-tabular"'));

        $this->assertSame('qti-match-tabular', $interaction->getAttributeValue('class'));
    }

    private function importFirstMatchInteraction(string $xml): MatchInteraction
    {
        $method = new ReflectionMethod($this->subject, 'createQtiItemModel');
        $method->setAccessible(true);

        /** @var Item $item */
        $item = $method->invoke($this->subject, $xml, false);

        foreach ($item->getInteractions() as $interaction) {
            if ($interaction instanceof MatchInteraction) {
                return $interaction;
            }
        }

        $this->fail('The imported item does not contain any match interaction.');
    }

    private function getMatchItemXml(string $interactionClassAttribute): string
    {
        $namespace = 'http://www.imsglobal.org/xsd/imsqti_v2p1';
        $schema = 'http://www.imsglobal.org/xsd/qti/qtiv2p1/imsqti_v2p1.xsd';
        $responseProcessing = 'http://www.imsglobal.org/question/qti_v2p1/rptemplates/map_response';

        return <<<XML
        <?xml version="1.0" encoding="UTF-8"?>
        <assessmentItem xmlns="$namespace"
            xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
            xsi:schemaLocation="$namespace $schema"
            identifier="match" title="Characters and Plays" adaptive="false" timeDependent="false">
            <responseDeclaration identifier="RESPONSE" cardinality="multiple" baseType="directedPair">
                <correctResponse>
                    <value>C R</value>
                </correctResponse>
            </responseDeclaration>
            <outcomeDeclaration identifier="SCORE" cardinality="single" baseType="float"/>
            <itemBody>
                <matchInteraction responseIdentifier="RESPONSE" maxAssociations="4"$interactionClassAttribute>
                    <simpleMatchSet>
                        <simpleAssociableChoice identifier="C" matchMax="1">Capulet</simpleAssociableChoice>
                    </simpleMatchSet>
                    <simpleMatchSet>
                        <simpleAssociableChoice identifier="R" matchMax="4">Romeo</simpleAssociableChoice>
                    </simpleMatchSet>
                </matchInteraction>
            </itemBody>
            <responseProcessing template="$responseProcessing"/>
        </assessmentItem>
        XML;
    }
}
