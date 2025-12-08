<?php

/**
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
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 * Copyright (c) 2025 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiItem\test\unit\model\qti\scale;

use core_kernel_classes_Resource;
use oat\oatbox\log\LoggerService;
use oat\taoQtiItem\model\qti\metadata\exporter\scale\ScalePreprocessor;
use oat\taoQtiItem\model\qti\scale\ScaleHandler;
use oat\taoQtiItem\model\qti\scale\ScaleStorageService;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;

class ScaleHandlerTest extends TestCase
{
    private ScaleStorageService|MockObject $storageService;
    private ScalePreprocessor|MockObject $scalePreprocessor;
    private LoggerService|MockObject $logger;
    private ScaleHandler $subject;
    private core_kernel_classes_Resource|MockObject $item;

    protected function setUp(): void
    {
        $this->storageService = $this->createMock(ScaleStorageService::class);
        $this->scalePreprocessor = $this->createMock(ScalePreprocessor::class);
        $this->logger = $this->createMock(LoggerService::class);
        $this->subject = new ScaleHandler($this->storageService, $this->scalePreprocessor, $this->logger);
        $this->item = $this->createMock(core_kernel_classes_Resource::class);
    }

    public function testProcessPersistsScaleSelection(): void
    {
        $xml = <<<XML
<?xml version="1.0" encoding="UTF-8"?>
<assessmentItem xmlns="http://www.imsglobal.org/xsd/imsqti_v2p2">
    <outcomeDeclaration 
        identifier="SCORE" 
        cardinality="single" 
        baseType="float" 
        scale="http://example.org/scales/cefr" 
        rubric="Teacher rubric"/>
</assessmentItem>
XML;

        $this->storageService
            ->expects($this->once())
            ->method('isScalePath')
            ->with('')
            ->willReturn(false);

        $this->scalePreprocessor
            ->expects($this->once())
            ->method('getScaleRemoteList')
            ->willReturn([
                [
                    'uri' => 'http://example.org/scales/cefr',
                    'label' => 'CEFR',
                    'values' => ['1' => 'A1', '2' => 'A2']
                ]
            ]);

        $this->storageService
            ->expects($this->once())
            ->method('generateRelativePath')
            ->with('SCORE')
            ->willReturn('scales/generated.json');

        $this->storageService
            ->expects($this->once())
            ->method('storeScaleData')
            ->with(
                $this->item,
                'scales/generated.json',
                [
                    'identifier' => 'SCORE',
                    'scale' => [
                        'uri' => 'http://example.org/scales/cefr',
                        'label' => 'CEFR',
                        'values' => ['1' => 'A1', '2' => 'A2'],
                    ],
                    'rubric' => 'Teacher rubric',
                ]
            )
            ->willReturn('scales/generated.json');

        $this->storageService
            ->expects($this->once())
            ->method('cleanupScales')
            ->with($this->item, ['scales/generated.json']);

        $processed = $this->subject->process($xml, $this->item);

        $this->assertStringNotContainsString('scale="http://example.org/scales/cefr"', $processed);
        $this->assertStringNotContainsString('rubric="Teacher rubric"', $processed);
        $this->assertStringContainsString('longInterpretation="scales/generated.json"', $processed);
    }

    public function testProcessRemovesScaleWhenDeselected(): void
    {
        $xml = <<<XML
<?xml version="1.0" encoding="UTF-8"?>
<assessmentItem xmlns="http://www.imsglobal.org/xsd/imsqti_v2p2">
    <outcomeDeclaration 
        identifier="SCORE" 
        cardinality="single" 
        baseType="float" 
        longInterpretation="scales/existing.json"/>
</assessmentItem>
XML;

        $this->storageService
            ->expects($this->once())
            ->method('isScalePath')
            ->with('scales/existing.json')
            ->willReturn(true);

        $this->storageService
            ->expects($this->once())
            ->method('deleteScale')
            ->with($this->item, 'scales/existing.json');

        $this->storageService
            ->expects($this->once())
            ->method('cleanupScales')
            ->with($this->item, []);

        $processed = $this->subject->process($xml, $this->item);

        $this->assertStringNotContainsString('longInterpretation=', $processed);
    }
}
