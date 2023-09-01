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
 * Copyright (c) 2020  (original work) Open Assessment Technologies SA;
 *
 * @author Julien Sébire, <julien@taotesting.com>
 */

namespace oat\taoQtiItem\test\unit\model;

use core_kernel_classes_Class as RdfClass;
use oat\generis\test\TestCase;
use oat\tao\model\TaoOntology;
use oat\taoQtiItem\model\qti\ImportService;

class ImportServiceTest extends TestCase
{
    /**
     * @return array
     */
    public function testRetrieveFullPathLabelsWithNonClassResourceReturnsEmptyString()
    {
        $subject = new ImportService();
        $this->assertEquals('', $subject->retrieveFullPathLabels('whatever'));
    }

    /**
     * @return array
     */
    public function testRetrieveFullPathLabelsWithRootClassResourceReturnsEmptyArray()
    {
        $class = $this->getMockBuilder(RdfClass::class)
            ->disableOriginalConstructor()
            ->setMethods(['getUri'])
            ->getMock();
        $class->method('getUri')->willReturn(TaoOntology::CLASS_URI_ITEM);

        $subject = new ImportService();
        $this->assertEquals([], $subject->retrieveFullPathLabels($class));
    }

    /**
     * @return array
     */
    public function testRetrieveFullPathLabelsWithSeveralClassResourcesReturnsArray()
    {
        $rootUri = TaoOntology::CLASS_URI_ITEM;
        $uri1 = 'http://example.com/uri2';
        $uri2 = 'http://example.com/uri3';

        $label1 = 'First subbclass label';
        $label2 = 'second subbclass label';

        $rootClass = $this->getMockBuilder(RdfClass::class)
            ->disableOriginalConstructor()
            ->setMethods(['getUri'])
            ->getMock();
        $rootClass->method('getUri')->willReturn($rootUri);

        $subclass1 = $this->getMockBuilder(RdfClass::class)
            ->disableOriginalConstructor()
            ->setMethods(['getUri', 'getLabel', 'getParentClasses'])
            ->getMock();
        $subclass1->method('getUri')->willReturn($uri1);
        $subclass1->method('getLabel')->willReturn($label1);
        $subclass1->method('getParentClasses')->willReturn([$rootUri => $rootClass]);

        $subclass2 = $this->getMockBuilder(RdfClass::class)
            ->disableOriginalConstructor()
            ->setMethods(['getUri', 'getLabel', 'getParentClasses'])
            ->getMock();
        $subclass2->method('getUri')->willReturn($uri2);
        $subclass2->method('getLabel')->willReturn($label2);
        $subclass2->method('getParentClasses')->willReturn([$uri1 => $subclass1]);

        $subject = new ImportService();
        $this->assertEquals([$label1, $label2], $subject->retrieveFullPathLabels($subclass2));
    }
}
