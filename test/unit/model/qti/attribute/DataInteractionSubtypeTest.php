<?php

declare(strict_types=1);

namespace oat\taoQtiItem\test\unit\model\qti\attribute;

use oat\taoQtiItem\model\qti\attribute\DataInteractionSubtype;
use PHPUnit\Framework\TestCase;

class DataInteractionSubtypeTest extends TestCase
{
    public function testAttributeMetadata(): void
    {
        $attribute = new DataInteractionSubtype();

        self::assertSame('data-interaction-subtype', $attribute->getName());
        self::assertSame('oat\\taoQtiItem\\model\\qti\\datatype\\QtiString', $attribute->getType());
        self::assertFalse($attribute->isRequired());
        self::assertTrue($attribute->isNull());
        self::assertNull($attribute->getValue());
    }
}
