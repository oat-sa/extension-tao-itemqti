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
 * Copyright (c) 2022 (original work) Open Assessment Technologies SA;
 */
declare(strict_types=1);

namespace oat\taoQtiItem\test\unit\mode\qti;

use DOMDocument;
use oat\taoQtiItem\model\qti\Item;
use oat\taoQtiItem\model\qti\ParserFactory;
use oat\generis\test\TestCase;
use Psr\Log\LoggerInterface;

class ParserFactoryTest extends TestCase
{
    private const PRODUCT_NAME = 'TAO';

    /** @var LoggerInterface */
    private $logger;

    protected function setUp(): void
    {
        parent::setUp();

        $this->logger = $this->createMock(LoggerInterface::class);

        if (!defined('PRODUCT_NAME')) {
            define('PRODUCT_NAME', self::PRODUCT_NAME);
        }
        if (!defined('ROOT_URL')) {
            define('ROOT_URL', __DIR__ . '/../../../../../');
        }
        if (!defined('CONFIG_PATH')) {
            define('CONFIG_PATH', ROOT_URL . 'config/');
        }
        if (!defined('EXTENSION_PATH')) {
            define('EXTENSION_PATH', ROOT_URL);
        }
    }

    public function testParseItem(): void
    {
        $itemDocument = <<<ITEM_DOC
<?xml version="1.0" encoding="UTF-8"?>
<assessmentItem
        xmlns="http://www.imsglobal.org/xsd/imsqti_v2p2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xmlns:m="http://www.w3.org/1998/Math/MathML"
        xsi:schemaLocation="http://www.imsglobal.org/xsd/imsqti_v2p2 http://www.imsglobal.org/xsd/qti/qtiv2p2/imsqti_v2p2.xsd"
        identifier="i61dbf0028b0ca4904497f514befea47f" title="Item 1" adaptive="false" timeDependent="false"
        xml:lang="en-US">
    <itemBody>
        <div class="grid-row">
            <div class="col-12">
                <p>Lorem ipsum dolor sit amet, consectetur adipisicing ...</p>
            </div>
        </div>
    </itemBody>
</assessmentItem>
ITEM_DOC;

        $dom = new DOMDocument();
        $dom->loadXML($itemDocument);

        $parser = new ParserFactory($dom);

        $this->logger->expects($this->once())->method('debug')
            ->with('Started parsing of QTI item i61dbf0028b0ca4904497f514befea47f', ['TAOITEMS']);
        $parser->setLogger($this->logger);

        $item = $parser->load();

        self::assertInstanceOf(Item::class, $item);
        self::assertEquals([], $item->getBody()->getAttributeValues());
        self::assertEquals(
            '
        <div class="grid-row">
            <div class="col-12">
                <p>Lorem ipsum dolor sit amet, consectetur adipisicing ...</p>
            </div>
        </div>
    ',
            $item->getBody()->getBody()
        );
    }

    public function testParseItemWithDirAttributeOnItemBody(): void
    {
        $itemDocument = <<<ITEM_DOC
<?xml version="1.0" encoding="UTF-8"?>
<assessmentItem
        xmlns="http://www.imsglobal.org/xsd/imsqti_v2p2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xmlns:m="http://www.w3.org/1998/Math/MathML"
        xsi:schemaLocation="http://www.imsglobal.org/xsd/imsqti_v2p2 http://www.imsglobal.org/xsd/qti/qtiv2p2/imsqti_v2p2.xsd"
        identifier="i61dbf0028b0ca4904497f514befea47f" title="Item 1" adaptive="false" timeDependent="false"
        xml:lang="en-US">
    <itemBody dir="rtl">
        <div class="grid-row">
            <div class="col-12">
                <p>Lorem ipsum dolor sit amet, consectetur adipisicing ...</p>
            </div>
        </div>
    </itemBody>
</assessmentItem>
ITEM_DOC;

        $dom = new DOMDocument();
        $dom->loadXML($itemDocument);

        $parser = new ParserFactory($dom);

        $this->logger->expects($this->once())->method('debug')
            ->with('Started parsing of QTI item i61dbf0028b0ca4904497f514befea47f', ['TAOITEMS']);
        $parser->setLogger($this->logger);
        $item = $parser->load();

        self::assertInstanceOf(Item::class, $item);
        self::assertEquals(['dir' => 'rtl'], $item->getBody()->getAttributeValues());
        self::assertEquals(
            '
        <div class="grid-row">
            <div class="col-12">
                <p>Lorem ipsum dolor sit amet, consectetur adipisicing ...</p>
            </div>
        </div>
    ',
            $item->getBody()->getBody()
        );
    }
}
