<?php

declare(strict_types=1);

namespace oat\taoQtiItem\test\unit\model\qti\exception;

use common_exception_UserReadableException;
use oat\taoQtiItem\model\qti\exception\StylesheetNotCssException;
use PHPUnit\Framework\TestCase;

class StylesheetNotCssExceptionTest extends TestCase
{
    public function testGetUserMessageNamesTheOffendingFile(): void
    {
        $exception = new StylesheetNotCssException('photo.png');

        $this->assertInstanceOf(common_exception_UserReadableException::class, $exception);
        $this->assertStringContainsString('photo.png', $exception->getUserMessage());
        $this->assertStringContainsString('cannot be used as a style sheet', $exception->getUserMessage());
    }
}
