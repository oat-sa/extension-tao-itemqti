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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 */

namespace oat\taoQtiItem\model\qti\metadata;

/**
 * MetadataClassLookup interface.
 *
 * All classes claiming at being able to
 *
 * * lookup for a target import Ontology Class
 * * AND create a target import Ontology Class if no suitable one is found
 *
 * for a given item must implement this interface.
 *
 * @author Jérôme Bogaerts <jerome@taotesting.com>
 *
 */
interface MetadataClassLookupClassCreator extends MetadataClassLookup
{
    /**
     * Whether or not a class has been created.
     *
     * Invoke this method to know whether or not during the last invokation of the MetadataClassLookup::lookup() method,
     * Ontology Classes were created for this purpose.
     *
     * @return array An array of core_kernel_classes_Class object.
     */
    public function createdClasses();
}
