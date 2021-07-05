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

namespace oat\taoQtiItem\test\unit\model\import\Validator;

use oat\generis\test\TestCase;
use oat\oatbox\log\LoggerService;
use oat\taoQtiItem\model\import\CsvTemplate;
use oat\taoQtiItem\model\import\Parser\Exception\InvalidCsvImportException;
use oat\taoQtiItem\model\import\Repository\CsvTemplateRepository;
use oat\taoQtiItem\model\import\TemplateInterface;
use oat\taoQtiItem\model\import\Validator\AggregatedValidationException;
use oat\taoQtiItem\model\import\Validator\HeaderValidator;

class HeaderValidatorTest extends TestCase
{
    /** @var HeaderValidator */
    private $subject;

    public function setUp(): void
    {
        $loggerMock = $this->createMock(LoggerService::class);

        $this->subject = new HeaderValidator();
        $this->subject->setLogger($loggerMock);
    }

    public function testValidateSuccessfully(): void
    {
        $content = [
            'name',
            'question',
            'shuffle',
            'min_choices',
            'max_choices',
            'choice_1',
            'choice_2',
            'choice_3',
            'choice_1_score',
            'choice_2_score',
            'choice_3_score',
            'metadata_alias1',
            'metadata_alias2',
            'metadata_alias3'
        ];

        $this->assertNull($this->subject->validate($content, $this->getDefaultTemplate()));
    }

    public function testValidateRequiredColumnsAreSent(): void
    {
        $content = [
            'shuffle',
            'metadata_alias1',
            'metadata_alias2',
            'metadata_alias3'
        ];

        try {
            $this->subject->validate($content, $this->getDefaultTemplate());
        } catch (AggregatedValidationException $exception) {
            $this->assertEquals('Header `%s` is required', $exception->getErrors()[0]->getMessage());
            $this->assertEquals('name', $exception->getErrors()[0]->getInterpolationData()[0]);
            $this->assertEquals('Header `%s` is required', $exception->getErrors()[1]->getMessage());
            $this->assertEquals('question', $exception->getErrors()[1]->getInterpolationData()[0]);
            $this->assertEquals('Header `%s` is required', $exception->getErrors()[2]->getMessage());
            $this->assertEquals('choice_[1-99]', $exception->getErrors()[2]->getInterpolationData()[0]);
            $this->assertEquals(
                'Header `%s` must be provided at least `%s` times',
                $exception->getErrors()[3]->getMessage()
            );
            $this->assertEquals('choice_[1-99]', $exception->getErrors()[3]->getInterpolationData()[0]);
        }
    }

    public function testValidateMissingMatchingColumnsAreSent(): void
    {
        $content = [
            'name',
            'question',
            'shuffle',
            'min_choices',
            'max_choices',
            'choice_1',
            'choice_2', // missing choice_2_score
            'choice_1_score',
            'choice_3_score', // missing choice_3
            'metadata_alias1',
            'metadata_alias2',
            'metadata_alias3'
        ];

        try {
            $this->subject->validate($content, $this->getDefaultTemplate());
        } catch (AggregatedValidationException $exception) {
            $this->assertEquals('Header `%s` is required', $exception->getErrors()[0]->getMessage());
            $this->assertEquals('choice_2_score', $exception->getErrors()[0]->getInterpolationData()[0]);
            $this->assertEquals('Header `%s` is required', $exception->getErrors()[1]->getMessage());
            $this->assertEquals('choice_3', $exception->getErrors()[1]->getInterpolationData()[0]);
        }
    }

    public function testValidateNullHeader(): void
    {
        $content = [null];

        try {
            $this->subject->validate($content, $this->getDefaultTemplate());
        } catch (AggregatedValidationException $exception) {
            $this->assertEquals('Header `%s` is required', $exception->getErrors()[0]->getMessage());
            $this->assertEquals('name', $exception->getErrors()[0]->getInterpolationData()[0]);
            $this->assertEquals('Header `%s` is required', $exception->getErrors()[1]->getMessage());
            $this->assertEquals('question', $exception->getErrors()[1]->getInterpolationData()[0]);
            $this->assertEquals('Header `%s` is required', $exception->getErrors()[2]->getMessage());
            $this->assertEquals('choice_[1-99]', $exception->getErrors()[2]->getInterpolationData()[0]);
        }
    }

    public function testValidateEmptyHeader(): void
    {
        $content = [];

        try {
            $this->subject->validate($content, $this->getDefaultTemplate());
        } catch (AggregatedValidationException $exception) {
            $this->assertEquals('Header `%s` is required', $exception->getErrors()[0]->getMessage());
            $this->assertEquals('name', $exception->getErrors()[0]->getInterpolationData()[0]);
            $this->assertEquals('Header `%s` is required', $exception->getErrors()[1]->getMessage());
            $this->assertEquals('question', $exception->getErrors()[1]->getInterpolationData()[0]);
            $this->assertEquals('Header `%s` is required', $exception->getErrors()[2]->getMessage());
            $this->assertEquals('choice_[1-99]', $exception->getErrors()[2]->getInterpolationData()[0]);
        }
    }

    private function getDefaultTemplate(): TemplateInterface
    {
        return new CsvTemplate(
            CsvTemplateRepository::DEFAULT,
            CsvTemplateRepository::DEFAULT_DEFINITION
        );
    }
}
