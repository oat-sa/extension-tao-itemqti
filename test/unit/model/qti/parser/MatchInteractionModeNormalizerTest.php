<?php

/*
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; under version 2
 * of the License (non-upgradable).
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 31 Milk St # 960789 Boston, MA 02196 USA.
 *
 * Copyright (c) 2026 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiItem\test\unit\model\qti\parser;

use oat\taoQtiItem\model\qti\Item;
use oat\taoQtiItem\model\qti\interaction\ChoiceInteraction;
use oat\taoQtiItem\model\qti\interaction\Interaction;
use oat\taoQtiItem\model\qti\interaction\MatchInteraction;
use oat\taoQtiItem\model\qti\parser\MatchInteractionModeNormalizer;
use PHPUnit\Framework\TestCase;

class MatchInteractionModeNormalizerTest extends TestCase
{
    private MatchInteractionModeNormalizer $subject;

    protected function setUp(): void
    {
        parent::setUp();

        $this->subject = new MatchInteractionModeNormalizer();
    }

    public function testAddsNonTabularModeWhenClassIsMissing(): void
    {
        $interaction = new MatchInteraction();

        $this->subject->normalize($this->createItem($interaction));

        $this->assertSame('qti-match-non-tabular', $interaction->getAttributeValue('class'));
    }

    public function testAddsNonTabularModeWhenClassHasNoMode(): void
    {
        $interaction = new MatchInteraction(['class' => 'custom-class another-class']);

        $this->subject->normalize($this->createItem($interaction));

        $this->assertSame(
            'custom-class another-class qti-match-non-tabular',
            $interaction->getAttributeValue('class')
        );
    }

    /**
     * @dataProvider preservedClassProvider
     */
    public function testKeepsClassWhenModeIsAlreadyDefined(string $class): void
    {
        $interaction = new MatchInteraction(['class' => $class]);

        $this->subject->normalize($this->createItem($interaction));

        $this->assertSame($class, $interaction->getAttributeValue('class'));
    }

    public function preservedClassProvider(): array
    {
        return [
            'tabular' => ['qti-match-tabular'],
            'non tabular' => ['qti-match-non-tabular'],
            'tabular among other classes' => ['custom-class qti-match-tabular qti-choices-top'],
            'non tabular among other classes' => ['custom-class qti-match-non-tabular qti-choices-left'],
        ];
    }

    public function testIgnoresOtherInteractionTypes(): void
    {
        $interaction = new ChoiceInteraction();

        $this->subject->normalize($this->createItem($interaction));

        $this->assertNull($interaction->getAttributeValue('class'));
    }

    public function testNormalizesEveryMatchInteractionOfTheItem(): void
    {
        $withoutMode = new MatchInteraction();
        $withMode = new MatchInteraction(['class' => 'qti-match-tabular']);

        $this->subject->normalize($this->createItem($withoutMode, new ChoiceInteraction(), $withMode));

        $this->assertSame('qti-match-non-tabular', $withoutMode->getAttributeValue('class'));
        $this->assertSame('qti-match-tabular', $withMode->getAttributeValue('class'));
    }

    private function createItem(Interaction ...$interactions): Item
    {
        $item = $this->createMock(Item::class);
        $item
            ->method('getInteractions')
            ->willReturn($interactions);

        return $item;
    }
}
