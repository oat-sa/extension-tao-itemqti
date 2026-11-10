<?php

declare(strict_types=1);

namespace oat\taoQtiItem\test\unit\model\qti\interaction;

use oat\taoQtiItem\model\qti\choice\GapText;
use oat\taoQtiItem\model\qti\interaction\GraphicGapMatchInteraction;
use PHPUnit\Framework\TestCase;

class GraphicGapMatchInteractionTest extends TestCase
{
    public function testCreateGapTextAndExportInToArray(): void
    {
        $interaction = new GraphicGapMatchInteraction();
        $gapText = $interaction->createGapText('London');

        self::assertInstanceOf(GapText::class, $gapText);
        self::assertSame('London', $gapText->getContent());

        $data = $interaction->toArray();
        self::assertArrayHasKey('gapTexts', $data);
        self::assertCount(1, $data['gapTexts']);
    }

    public function testRemoveGapText(): void
    {
        $interaction = new GraphicGapMatchInteraction();
        $gapText = $interaction->createGapText('Paris');
        $gapText->setIdentifier('label_paris');

        $interaction->removeChoice($gapText);

        self::assertSame([], $interaction->getGapTexts());
    }
}
