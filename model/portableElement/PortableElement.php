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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA;
 *
 */
namespace oat\taoQtiItem\model\portableElement;

use oat\oatbox\PhpSerializable;
use oat\taoQtiItem\model\portableElement\common\model\PortableElementObject;
use oat\taoQtiItem\model\portableElement\common\parser\implementation\PortableElementDirectoryParser;
use oat\taoQtiItem\model\portableElement\common\parser\implementation\PortableElementPackageParser;
use oat\taoQtiItem\model\portableElement\common\parser\itemParser\PortableElementItemParserInterface;
use oat\taoQtiItem\model\portableElement\common\storage\PortableElementRegistry;
use oat\taoQtiItem\model\portableElement\common\validator\PortableElementModelValidator;

interface PortableElement extends PhpSerializable
{
    /**
     * @return string
     */
    public function getId();

    /**
     * @return array
     */
    public function getDefinitionFiles();

    /**
     * @return string
     */
    public function getManifestName();

    /**
     * @param array $data
     * @return PortableElementObject
     */
    public function createDataObject(array $data);

    /**
     * @return PortableElementRegistry
     */
    public function getRegistry();

    /**
     * @return PortableElementModelValidator
     */
    public function getValidator();

    /**
     * @return PortableElementDirectoryParser
     */
    public function getDirectoryParser();

    /**
     * @return PortableElementPackageParser
     */
    public function getPackageParser();

    /**
     * @return PortableElementItemParserInterface
     */
    public function getItemParser();
}