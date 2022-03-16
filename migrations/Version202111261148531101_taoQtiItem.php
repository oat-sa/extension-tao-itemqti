<?php

declare(strict_types=1);

namespace oat\taoQtiItem\migrations;

use Doctrine\DBAL\Schema\Schema;
use oat\tao\scripts\tools\migrations\AbstractMigration;
use oat\taoQtiItem\model\compile\QtiItemCompilerAssetBlacklist;

final class Version202111261148531101_taoQtiItem extends AbstractMigration
{
    private const BASE64_DATA_PATTERN = '/^data:[^\/]+\/[^;]+(;charset=[\w]+)?;base64,/';

    public function getDescription(): string
    {
        return 'Removes base64 data pattern from item compilation asset blacklist.';
    }

    public function up(Schema $schema): void
    {
        if ($this->getServiceManager()->has(QtiItemCompilerAssetBlacklist::SERVICE_ID)) {
            $service = $this->getServiceManager()->get(QtiItemCompilerAssetBlacklist::SERVICE_ID);
            $currentBlacklist = $service->getOption(QtiItemCompilerAssetBlacklist::BLACKLIST);
            $updatedBlacklist = [];
            foreach ($currentBlacklist as $item) {
                if ($item !== self::BASE64_DATA_PATTERN) {
                    $updatedBlacklist[] = $item;
                }
            }
            $service->setOption(QtiItemCompilerAssetBlacklist::BLACKLIST, $updatedBlacklist);
            $this->getServiceManager()->register(QtiItemCompilerAssetBlacklist::SERVICE_ID, $service);
        }
    }

    public function down(Schema $schema): void
    {
        if ($this->getServiceManager()->has(QtiItemCompilerAssetBlacklist::SERVICE_ID)) {
            $service = $this->getServiceManager()->get(QtiItemCompilerAssetBlacklist::SERVICE_ID);
            $blacklist = $service->getOption(QtiItemCompilerAssetBlacklist::BLACKLIST);

            if (!in_array(self::BASE64_DATA_PATTERN, $blacklist, true)) {
                $blacklist[] = self::BASE64_DATA_PATTERN;
            }
            $service->setOption(QtiItemCompilerAssetBlacklist::BLACKLIST, $blacklist);
            $this->getServiceManager()->register(QtiItemCompilerAssetBlacklist::SERVICE_ID, $service);
        }
    }
}
