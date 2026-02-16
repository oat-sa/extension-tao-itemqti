<?php

declare(strict_types=1);

namespace oat\taoQtiItem\test\unit\model\qti\interaction;

use oat\taoQtiItem\model\qti\interaction\ObjectInteraction;
use oat\taoQtiItem\model\qti\QtiObject;
use PHPUnit\Framework\TestCase;

class ObjectInteractionTest extends TestCase
{
    private function buildInteraction(): ObjectInteraction
    {
        return new class extends ObjectInteraction {
            protected static $qtiTagName = 'dummyObjectInteraction';
        };
    }

    public function testObjectIsInitialized(): void
    {
        $interaction = $this->buildInteraction();

        self::assertInstanceOf(QtiObject::class, $interaction->getObject());
    }

    public function testToArrayIncludesObject(): void
    {
        $interaction = $this->buildInteraction();

        $array = $interaction->toArray();

        self::assertArrayHasKey('object', $array);
        self::assertIsArray($array['object']);
    }
}
