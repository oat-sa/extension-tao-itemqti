<?php

namespace oat\taoQtiItem\test\unit\model\qti\datatype;

//use oat\generis\test\TestCase;
use PHPUnit\Framework\TestCase;
use oat\taoQtiItem\model\qti\datatype\Language;

class LanguageValidateLanguageCodesTest extends TestCase
{
    private const LANGUAGE_CODES_JSON_PATH = __DIR__ . '/../../../../resources/pisa-qa-translation-locales.json';

    /**
     * @dataProvider provideLanguageCodes
     */
    public function testValidate(string $languageCode): void
    {
        $this->assertTrue(Language::validate($languageCode));
    }

    public function provideLanguageCodes()
    {
        return json_decode(file_get_contents(realpath(self::LANGUAGE_CODES_JSON_PATH)), true);
    }
}
