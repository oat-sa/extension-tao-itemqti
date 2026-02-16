<?php

declare(strict_types=1);

namespace oat\taoQtiItem\test\unit\model\qti\choice;

use oat\taoQtiItem\model\qti\choice\AssociableHotspot;
use PHPUnit\Framework\TestCase;

class AssociableHotspotTest extends TestCase
{
    public function testDataAttributesAreOptional(): void
    {
        $choice = new AssociableHotspot();

        self::assertTrue($choice->hasAttribute('data-start'));
        self::assertTrue($choice->hasAttribute('data-end'));

        $values = $choice->getAttributeValues();

        self::assertArrayNotHasKey('data-start', $values);
        self::assertArrayNotHasKey('data-end', $values);
    }

    public function testDataAttributesIncludedWhenSet(): void
    {
        $choice = new AssociableHotspot();
        $choice->setAttribute('data-start', true);
        $choice->setAttribute('data-end', true);

        $values = $choice->getAttributeValues();

        self::assertArrayHasKey('data-start', $values);
        self::assertArrayHasKey('data-end', $values);
        self::assertTrue($values['data-start']);
        self::assertTrue($values['data-end']);
    }
}
