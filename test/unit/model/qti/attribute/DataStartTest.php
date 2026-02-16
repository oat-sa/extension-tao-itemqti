<?php

declare(strict_types=1);

namespace oat\taoQtiItem\test\unit\model\qti\attribute;

use oat\taoQtiItem\model\qti\attribute\DataStart;
use PHPUnit\Framework\TestCase;

class DataStartTest extends TestCase
{
    public function testAttributeMetadata(): void
    {
        $attribute = new DataStart();

        self::assertSame('data-start', $attribute->getName());
        self::assertSame('oat\\taoQtiItem\\model\\qti\\datatype\\QtiBoolean', $attribute->getType());
        self::assertFalse($attribute->isRequired());
        self::assertTrue($attribute->isNull());
        self::assertNull($attribute->getValue());
    }
}
