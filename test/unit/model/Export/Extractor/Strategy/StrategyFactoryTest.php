<?php

namespace oat\taoQtiItem\test\unit\model\Export\Extractor\Strategy;

use oat\taoQtiItem\model\Export\Extractor\Strategy\DefaultStrategy;
use oat\taoQtiItem\model\Export\Extractor\Strategy\ColumnStrategy;
use oat\taoQtiItem\model\Export\Extractor\Strategy\Strategy;
use oat\taoQtiItem\model\Export\Extractor\Strategy\StrategyFactory;
use oat\generis\test\TestCase;

class StrategyFactoryTest extends TestCase
{
    public function testFactoryBuildsStrategy()
    {
        $this->assertInstanceOf(Strategy::class, StrategyFactory::create([], 'column', []));
    }

    public function testFactoryBuildsDefaultStrategy()
    {
        $this->assertInstanceOf(
            DefaultStrategy::class,
            StrategyFactory::create(['valuesAsColumns' => false], 'column', [])
        );
        $this->assertInstanceOf(DefaultStrategy::class, StrategyFactory::create([], 'column', []));
    }

    public function testFactoryBuildsColumnStrategy()
    {
        $this->assertInstanceOf(
            ColumnStrategy::class,
            StrategyFactory::create(['valuesAsColumns' => true], 'column', [])
        );
    }
}
