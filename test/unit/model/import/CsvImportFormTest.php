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
 * Copyright (c) 2021  (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiItem\test\unit\model\import;

use oat\generis\test\TestCase;
use oat\taoQtiItem\model\import\CsvImportForm;
use oat\taoQtiItem\model\import\CsvItemImporter;

class CsvItemImportTest extends TestCase
{
    /** @var CsvItemImporter */
    private $subject;

    public function setUp(): void
    {
        $this->subject = new CsvImportForm();
    }

    public function testInitForm(): void
    {
        $this->assertNull($this->subject->initForm());
    }

    public function testInitElements(): void
    {
        $this->assertNull($this->subject->initElements());
    }
}
