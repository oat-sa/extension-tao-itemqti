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
 */

declare(strict_types=1);

namespace oat\taoQtiItem\test\unit\model\listener;

use common_Exception;
use core_kernel_classes_ContainerCollection;
use core_kernel_classes_Property;
use core_kernel_classes_Resource;
use core_kernel_persistence_Exception;
use oat\generis\model\data\Ontology;
use oat\generis\model\fileReference\FileReferenceSerializer;
use oat\generis\test\MockObject;
use oat\generis\test\TestCase;
use oat\tao\model\featureFlag\FeatureFlagChecker;
use oat\tao\model\IdentifierGenerator\Generator\IdentifierGeneratorInterface;
use oat\tao\model\IdentifierGenerator\Generator\IdentifierGeneratorProxy;
use oat\taoQtiItem\model\qti\copyist\QtiXmlDataManager;
use tao_models_classes_FileNotFoundException;
use taoItems_models_classes_ItemsService;
use oat\oatbox\filesystem\Directory;
use oat\oatbox\filesystem\File;

class QtiXmlDataManagerTest extends TestCase
{
    /**
     * @var QtiXmlDataManager
     */
    private $service;

    protected function setUp(): void
    {
        parent::setUp();

        $ontologyMock =  $this->getOntologyMock();

        $propertyMock = $this->createMock(core_kernel_classes_Property::class);

        $directoryMock = $this->createMock(Directory::class);
        $directoryMock->method('getFlyIterator')
            ->willReturn(['file.xml', 'another.jpeg', 'qti.xml']);
        $directoryMock->method('getRelPath')->willReturnCallback(static function ($param) {
            return $param;
        });

        $fileReferenceSerializerMock = $this->createMock(FileReferenceSerializer::class);
        $fileReferenceSerializerMock
            ->method('unserializeDirectory')
            ->willReturn($directoryMock);

        $itemsServiceMock = $this->createMock(taoItems_models_classes_ItemsService::class);
        $itemsServiceMock
            ->expects(self::exactly(3))
            ->method('getItemContentProperty')
            ->willReturn($propertyMock);
        $itemsServiceMock
            ->expects(self::exactly(2))
            ->method('getItemDirectory')
            ->willReturn($directoryMock);

        $itemResourceMock = $this->createMock(core_kernel_classes_Resource::class);
        $itemResourceMock->method('getUri')->willReturn('local#id1234source');
        $itemResourceMock
            ->expects(self::once())
            ->method('getUsedLanguages')
            ->willReturn(['lang1', 'lang2']);

        $containerCollectionMock = $this->createMock(core_kernel_classes_ContainerCollection::class);
        $containerCollectionMock
            ->method('getIterator')
            ->willReturn(['a.xml']);

        $itemResourceMock
            ->expects(self::exactly(2))
            ->method('getPropertyValuesCollection')
            ->willReturn($containerCollectionMock);

        $ontologyMock
            ->method('getResource')
            ->willReturnOnConsecutiveCalls($itemResourceMock);

        $this->featureFlagCheckerMock = $this->createMock(FeatureFlagChecker::class);

        $identifierGenerator = $this->createMock(IdentifierGeneratorInterface::class);

        $serviceLocatorMock = $this->getServiceLocatorMock([
            FileReferenceSerializer::SERVICE_ID => $fileReferenceSerializerMock,
            taoItems_models_classes_ItemsService::class => $itemsServiceMock,
            FeatureFlagChecker::class => $this->featureFlagCheckerMock,
            IdentifierGeneratorProxy::class => $identifierGenerator,
        ]);

        $self = $this;
        $directoryMock->method('getFile')->willReturnCallback(static function ($param) use ($self) {
            $fileMock = $self->createMock(File::class);
            $fileMock->method('getBasename')->willReturn($param);
            $fileMock
                ->method('read')
                ->willReturn(
                    '<assessmentItem xmlns="http://www.imsglobal.org/xsd/imsqti_v2p2" '
                        . 'xmlns:m="http://www.w3.org/1998/Math/MathML" '
                        . 'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" '
                        . 'xsi:schemaLocation="http://www.imsglobal.org/xsd/imsqti_v2p2 '
                        . 'http://www.imsglobal.org/xsd/qti/qtiv2p2/imsqti_v2p2.xsd" identifier="id1234source" '
                        . 'title="test 5" label="test 5" xml:lang="en-US" adaptive="false" timeDependent="false" '
                        . 'toolName="TAO" toolVersion="3.4.0-sprint136"></assessmentItem>'
                );
            $fileMock
                ->method('write')
                ->with(
                    '<assessmentItem xmlns="http://www.imsglobal.org/xsd/imsqti_v2p2" '
                        . 'xmlns:m="http://www.w3.org/1998/Math/MathML" '
                        . 'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" '
                        . 'xsi:schemaLocation="http://www.imsglobal.org/xsd/imsqti_v2p2 '
                        . 'http://www.imsglobal.org/xsd/qti/qtiv2p2/imsqti_v2p2.xsd" identifier="id987destination" '
                        . 'title="test 5" label="test 5" xml:lang="en-US" adaptive="false" timeDependent="false" '
                        . 'toolName="TAO" toolVersion="3.4.0-sprint136"></assessmentItem>'
                );

            return $fileMock;
        });

        $this->service = new QtiXmlDataManager();
        $this->service->setAppNamespacePrefix('local#');
        $this->service->setServiceLocator($serviceLocatorMock);
        $this->service->setModel($ontologyMock);
    }

    /**
     * @return Ontology|MockObject
     */
    private function getOntologyMock(): Ontology
    {
        $propertyOriginMock = $this->createMock(core_kernel_classes_Property::class);
        $ontologyMock = $this->createMock(Ontology::class);
        $ontologyMock
            ->method('getProperty')
            ->willReturn($propertyOriginMock);

        return $ontologyMock;
    }


    /**
     * @throws common_Exception
     * @throws core_kernel_persistence_Exception
     * @throws tao_models_classes_FileNotFoundException
     */
    public function testLocalNamespaceItemSource(): void
    {
        $this->service->replaceItemIdentifier('local#id1234source', 'local#id987destination');
    }

    /**
     * @throws common_Exception
     * @throws core_kernel_persistence_Exception
     * @throws tao_models_classes_FileNotFoundException
     */
    public function testRemoteTaoNamespaceItemSource(): void
    {
        $this->service->replaceItemIdentifier('remote#id1234source', 'local#id987destination');
    }

    /**
     * @throws common_Exception
     * @throws core_kernel_persistence_Exception
     * @throws tao_models_classes_FileNotFoundException
     */
    public function testAnotherNamespaceItemSource(): void
    {
        $this->service->replaceItemIdentifier('id1234source', 'local#id987destination');
    }
}
