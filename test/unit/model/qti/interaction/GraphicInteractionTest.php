<?php

declare(strict_types=1);

namespace oat\taoQtiItem\test\unit\model\qti\interaction;

use oat\taoQtiItem\model\qti\container\ContainerStatic;
use oat\taoQtiItem\model\qti\interaction\GraphicInteraction;
use oat\taoQtiItem\model\qti\QtiObject;
use PHPUnit\Framework\TestCase;

class GraphicInteractionTest extends TestCase
{
    private function buildInteraction(): GraphicInteraction
    {
        return new class extends GraphicInteraction {
            protected static $qtiTagName = 'dummyGraphicInteraction';
        };
    }

    public function testInheritsObjectAndPrompt(): void
    {
        $interaction = $this->buildInteraction();

        self::assertInstanceOf(QtiObject::class, $interaction->getObject());
        self::assertInstanceOf(ContainerStatic::class, $interaction->getPrompt());
    }
}
