<?php

/**
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
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 * Copyright (c) 2026 (original work) Open Assessment Technologies SA;
 */

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
