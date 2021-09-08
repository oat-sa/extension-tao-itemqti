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
 * Copyright (c) 2021  (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiItem\test\unit\model\import\Parser;

use oat\generis\test\TestCase;
use oat\taoQtiItem\model\import\CsvItem;
use oat\taoQtiItem\model\import\Parser\ChoiceParser;
use oat\taoQtiItem\model\import\Parser\ColumnParserInterface;
use oat\taoQtiItem\model\import\Parser\CsvLineConverter;
use oat\taoQtiItem\model\import\Parser\MetadataParser;
use oat\taoQtiItem\model\import\Repository\TemplateRepositoryInterface;
use oat\taoQtiItem\model\import\TemplateInterface;
use PHPUnit\Framework\MockObject\MockObject;

class CsvLineConverterTest extends TestCase
{
    /** @var CsvLineConverter */
    private $subject;

    /** @var ColumnParserInterface|MockObject */
    private $parser;

    /** @var TemplateInterface|MockObject */
    private $template;

    public function setUp(): void
    {
        $this->parser = $this->createMock(ColumnParserInterface::class);
        $this->parser
            ->method('parse')
            ->willReturn(['parsed']);

        $this->template = $this->createMock(TemplateInterface::class);
        $this->template
            ->method('getDefinition')
            ->willReturn(TemplateRepositoryInterface::DEFAULT_DEFINITION);

        $this->subject = new CsvLineConverter();
        $this->subject->setServiceLocator(
            $this->getServiceLocatorMock(
                [
                    MetadataParser::class => $this->parser,
                    ChoiceParser::class => $this->parser,
                ]
            )
        );
    }

    public function testConvert(): void
    {
        $line = [
            'name' => 'text for name',
            'question' => 'text for question',
            'shuffle' => 0,
            'language' => 'en-US',
            'min_choices' => 0,
            'max_choices' => 0,
            'choice_1' => 'text for choice_1',
            'choice_2' => 'text for choice_2',
            'choice_1_score' => '1',
            'choice_2_score' => '-1',
            'correct_answer' => 'choice_1',
            'metadata_CamelCase01' => 'md1',
            'metadata_normal_case_02' => 'md2',
            'metadata_with-dashes-03' => 'md3',
        ];

        $this->assertEquals(
            new CsvItem(
                'text for name',
                'text for question',
                false,
                0,
                0,
                'en-US',
                [
                    'parsed',
                ],
                [
                    'parsed',
                ]
            ),
            $this->subject->convert($line, $this->template)
        );
    }
}
