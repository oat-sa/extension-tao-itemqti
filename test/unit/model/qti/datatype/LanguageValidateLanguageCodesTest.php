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
 * Copyright (c) 2023 (original work) Open Assessment Technologies SA.
 */

namespace oat\taoQtiItem\test\unit\model\qti\datatype;

use PHPUnit\Framework\TestCase;
use oat\taoQtiItem\model\qti\datatype\Language;

class LanguageValidateLanguageCodesTest extends TestCase
{
    private const LANGUAGE_CODES_JSON_PATH = __DIR__ . '/../../../../resources/supported-locales.json';

    /**
     * @dataProvider supportedLocalesDataProvider
     * @dataProvider validTwoLetterCodesDataProvider
     * @dataProvider invalidLanguageCodesDataProvider
     */
    public function testValidate(bool $expected, string $languageCode): void
    {
        $this->assertEquals($expected, Language::validate($languageCode));
    }

    public function supportedLocalesDataProvider(): array
    {
        $languageData = json_decode(
            file_get_contents(realpath(self::LANGUAGE_CODES_JSON_PATH)),
            true
        );

        return array_map(
            static fn (array $localeData): array => [true, $localeData['code']],
            $languageData
        );
    }

    public function validTwoLetterCodesDataProvider(): array
    {
        return [
            [true, 'en'],
            [true, 'es'],
            [true, 'it'],
            [true, 'de'],
            [true, 'fi'],
        ];
    }

    public function invalidLanguageCodesDataProvider(): array
    {
        return [
            [false, 'lorem ipsum'],
            [false, 'fooBar'],
            [false, 'sp-ACE '],
            [false, ' sp-ACE'],
            [false, ' sp-ACE '],
            [false, 'long-EN'],
            [false, 'en-LONG'],
            [false, 'aa-bb-LONG'],
            [false, 'aa-bb-1'],
            [false, 'aa-bb-12'],
            [false, '0'],
            [false, '12'],

            // Numeric postfix should be 3, 5, 6, 7 or 8 chars long, and can
            // be preceded by "-x-"
            [false, 'aa-BB-1'],
            [false, 'aa-BB-1'],
            [false, 'aa-BB-12'],
            [false, 'aa-BB-1234'],
            [false, 'aa-BB-123456789'],
            [false, 'aa-BB-x-1'],
            [false, 'aa-BB-x-1'],
            [false, 'aa-BB-x-12'],
            [false, 'aa-BB-x-1234'],
            [false, 'aa-BB-x-123456789'],

            // No uppercase letters allowed after "-x-"
            [false, 'en-GB-x-Excscotl'],
            [false, 'en-GB-x-excscotL'],
        ];
    }
}
