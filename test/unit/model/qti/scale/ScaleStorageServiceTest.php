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
 * along with this program; if not, write to the Free Software Foundation, Inc.,
 * 31 Milk St # 960789 Boston, MA 02196 USA.
 *
 * Copyright (c) 2025 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiItem\test\unit\model\qti\scale;

use oat\taoQtiItem\model\qti\scale\ScaleStorageService;
use PHPUnit\Framework\TestCase;

class ScaleStorageServiceTest extends TestCase
{
    public function testGenerateRelativePathIncludesScalesDirectory(): void
    {
        $service = new ScaleStorageService($this->createStub(\taoItems_models_classes_ItemsService::class));
        $path = $service->generateRelativePath('Score Identifier');

        $this->assertStringStartsWith('scales/', $path);
        $this->assertStringEndsWith('.json', $path);
    }

    public function testIsScalePathValidatesStructure(): void
    {
        $service = new ScaleStorageService($this->createStub(\taoItems_models_classes_ItemsService::class));

        $this->assertTrue($service->isScalePath('scales/example.json'));
        $this->assertFalse($service->isScalePath('scale/example.json'));
        $this->assertFalse($service->isScalePath('scales/example.txt'));
    }
}
