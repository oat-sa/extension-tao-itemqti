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
use oat\taoQtiItem\model\import\CsvTemplate;
use oat\taoQtiItem\model\import\Parser\InvalidCsvImportException;
use oat\taoQtiItem\model\import\Repository\CsvTemplateRepository;
use oat\taoQtiItem\model\import\Validator\HeaderValidator;

class HeaderValidatorTest extends TestCase
{
    /** @var HeaderValidator */
    private $subject;

    public function setUp(): void
    {
        $this->subject = new HeaderValidator();
    }

    public function testValidateSuccessfully(): void
    {
        $template = new CsvTemplate(
            CsvTemplateRepository::DEFAULT,
            CsvTemplateRepository::DEFAULT_DEFINITION
        );

        $content = [
            'name',
            'question',
            'shuffle',
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

        $this->assertNull($this->subject->validate($content, $template));
    }

    public function testValidateRequiredColumnsAreSent(): void
    {
        $template = new CsvTemplate(
            CsvTemplateRepository::DEFAULT,
            CsvTemplateRepository::DEFAULT_DEFINITION
        );

        $content = [
            'shuffle',
            'metadata_alias1',
            'metadata_alias2',
            'metadata_alias3'
        ];

        try {
            $this->subject->validate($content, $template);
        } catch (InvalidCsvImportException $exception) {
            $this->assertContains('name', $exception->getMissingHeaderColumns());
            $this->assertContains('question', $exception->getMissingHeaderColumns());
            $this->assertContains('choice_[1-99]', $exception->getMissingHeaderColumns());
            $this->assertContains('choice_[1-99]_score', $exception->getMissingHeaderColumns());
        }
    }
}
