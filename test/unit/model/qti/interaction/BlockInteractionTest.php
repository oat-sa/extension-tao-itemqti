<?php

declare(strict_types=1);

namespace oat\taoQtiItem\test\unit\model\qti\interaction;

use oat\taoQtiItem\model\qti\container\ContainerStatic;
use oat\taoQtiItem\model\qti\interaction\BlockInteraction;
use oat\taoQtiItem\model\qti\interaction\Prompt;
use PHPUnit\Framework\TestCase;

class BlockInteractionTest extends TestCase
{
    private function buildInteraction(): BlockInteraction
    {
        return new class extends BlockInteraction {
            protected static $qtiTagName = 'dummyBlockInteraction';
        };
    }

    public function testPromptIsInitialized(): void
    {
        $interaction = $this->buildInteraction();

        self::assertInstanceOf(Prompt::class, $interaction->getPromptObject());
        self::assertInstanceOf(ContainerStatic::class, $interaction->getPrompt());
    }

    public function testToArrayIncludesPrompt(): void
    {
        $interaction = $this->buildInteraction();

        $array = $interaction->toArray();

        self::assertArrayHasKey('prompt', $array);
        self::assertIsArray($array['prompt']);
    }
}
