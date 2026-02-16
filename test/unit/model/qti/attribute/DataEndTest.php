<?php

declare(strict_types=1);

namespace oat\taoQtiItem\test\unit\model\qti\attribute;

use oat\taoQtiItem\model\qti\attribute\DataEnd;
use PHPUnit\Framework\TestCase;

class DataEndTest extends TestCase
{
    public function testAttributeMetadata(): void
    {
        $attribute = new DataEnd();

        self::assertSame('data-end', $attribute->getName());
        self::assertSame('oat\\taoQtiItem\\model\\qti\\datatype\\QtiBoolean', $attribute->getType());
        self::assertFalse($attribute->isRequired());
        self::assertTrue($attribute->isNull());
        self::assertNull($attribute->getValue());
    }
}
