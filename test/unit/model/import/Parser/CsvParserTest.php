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
use oat\oatbox\filesystem\File;
use oat\oatbox\log\LoggerService;
use oat\taoQtiItem\model\import\ItemInterface;
use oat\taoQtiItem\model\import\Parser\CsvLineConverter;
use oat\taoQtiItem\model\import\Parser\CsvParser;
use oat\taoQtiItem\model\import\TemplateInterface;
use oat\taoQtiItem\model\import\Validator\AggregatedValidationException;
use oat\taoQtiItem\model\import\Validator\ErrorValidationException;
use oat\taoQtiItem\model\import\Validator\HeaderValidator;
use oat\taoQtiItem\model\import\Validator\LineValidator;
use PHPUnit\Framework\MockObject\MockObject;
use Psr\Http\Message\StreamInterface;

class CsvParserTest extends TestCase
{
    /** @var CsvParser */
    private $subject;

    /** @var HeaderValidator|MockObject */
    private $headerValidator;

    /** @var LineValidator|MockObject */
    private $lineValidator;

    /** @var CsvLineConverter|MockObject */
    private $lineConvertor;

    public function setUp(): void
    {
        $this->lineValidator = $this->createMock(LineValidator::class);
        $this->headerValidator = $this->createMock(HeaderValidator::class);
        $this->lineConvertor = $this->createMock(CsvLineConverter::class);

        $this->subject = new CsvParser();
        $this->subject->setServiceLocator(
            $this->getServiceLocatorMock(
                [
                    HeaderValidator::class => $this->headerValidator,
                    LineValidator::class => $this->lineValidator,
                    CsvLineConverter::class => $this->lineConvertor,
                    LoggerService::SERVICE_ID => $this->createMock(LoggerService::class),
                ]
            )
        );
    }

    public function testParseFileWithSuccess(): void
    {
        $file = $this->expectFileReading();
        $item = $this->createMock(ItemInterface::class);

        $this->lineConvertor
            ->method('convert')
            ->willReturn($item);

        $this->headerValidator
            ->method('validate');

        $this->lineValidator
            ->method('validate');

        $template = $this->createMock(TemplateInterface::class);

        $result = $this->subject->parseFile($file, $template);

        $this->assertSame(1, $result->getTotalScannedItems());
        $this->assertSame(0, $result->getTotalSuccessfulImport());
        $this->assertCount(0, $result->getErrors());
        $this->assertCount(0, $result->getWarnings());
        $this->assertCount(0, $result->getErrorsAndWarnings());
        $this->assertCount(1, $result->getItems());
    }

    public function testParseWithInvalidHeader(): void
    {
        $file = $this->expectFileReading();

        $this->headerValidator
            ->method('validate')
            ->willThrowException(
                new AggregatedValidationException(
                    [
                        new ErrorValidationException('error')
                    ],
                    []
                )
            );

        $template = $this->createMock(TemplateInterface::class);

        $result = $this->subject->parseFile($file, $template);

        $this->assertSame(0, $result->getTotalScannedItems());
        $this->assertSame(0, $result->getTotalSuccessfulImport());
        $this->assertCount(1, $result->getErrors());
        $this->assertCount(0, $result->getWarnings());
        $this->assertCount(1, $result->getErrorsAndWarnings());
        $this->assertCount(0, $result->getItems());
    }

    public function testParseWithInvalidLine(): void
    {
        $file = $this->expectFileReading();

        $this->headerValidator
            ->method('validate');

        $this->lineValidator
            ->method('validate')
            ->willThrowException(
                new AggregatedValidationException(
                    [
                        new ErrorValidationException('error')
                    ],
                    []
                )
            );

        $template = $this->createMock(TemplateInterface::class);

        $result = $this->subject->parseFile($file, $template);

        $this->assertSame(1, $result->getTotalScannedItems());
        $this->assertSame(0, $result->getTotalSuccessfulImport());
        $this->assertCount(1, $result->getErrors());
        $this->assertCount(0, $result->getWarnings());
        $this->assertCount(1, $result->getErrorsAndWarnings());
        $this->assertCount(0, $result->getItems());
    }

    public function expectFileReading(): File
    {
        $file = $this->createMock(File::class);
        $stream = $this->createMock(StreamInterface::class);

        $file->method('readPsrStream')
            ->willReturn($stream);

        $content = 'my, header, here' . PHP_EOL;
        $content .= 'my, content, here';

        $stream->method('getContents')
            ->willReturn($content);

        return $file;
    }
}
