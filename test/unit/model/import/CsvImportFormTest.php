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
use tao_helpers_form_elements_xhtml_AsyncFile;
use tao_helpers_form_elements_xhtml_Hidden;

class CsvItemImportTest extends TestCase
{
    /** @var CsvItemImporter */
    private $subject;

    public function setUp(): void
    {
        $this->markTestSkipped('Refactoring of underlying code is required');

        $this->subject = new CsvImportForm();
    }

    public function testInitForm(): void
    {
        $this->assertNull($this->subject->initForm());

        $this->assertSame('export', $this->subject->getForm()->getName());
        $this->assertContains(
            [
                'name' => 'import',
                'value' => '<a href="#" class="form-submitter btn-success small"><span class="icon-import"></span> '
                    . 'Import</a>',
            ],
            (array)$this->subject->getForm()->getActions()[0]
        );
    }

    public function testInitElements(): void
    {
        $this->assertNull($this->subject->initElements());

        $elements = $this->subject->getForm()->getElements();

        $this->assertInstanceOf(tao_helpers_form_elements_xhtml_AsyncFile::class, $elements[0]);
        $this->assertInstanceOf(tao_helpers_form_elements_xhtml_Hidden::class, $elements[1]);
    }
}
