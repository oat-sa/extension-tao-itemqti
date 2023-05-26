<?php

declare(strict_types=1);

namespace oat\taoQtiItem\migrations;

use Doctrine\DBAL\Schema\Schema;
use oat\tao\scripts\tools\migrations\AbstractMigration;
use oat\taoQtiItem\model\search\Tokenizer\Filter\ClearValueFilter;
use oat\taoQtiItem\model\search\Tokenizer\Filter\NotBase64ContentFilter;
use oat\taoQtiItem\model\search\Tokenizer\Filter\NotJsonFilter;
use oat\taoQtiItem\model\search\QtiItemContentTokenizer;

final class Version202106170629531101_taoQtiItem extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        $this->getServiceManager()->register(
            QtiItemContentTokenizer::SERVICE_ID,
            new QtiItemContentTokenizer(
                [
                    QtiItemContentTokenizer::OPTION_FILTERS => [
                        new ClearValueFilter(),
                        new NotJsonFilter(),
                        new NotBase64ContentFilter(),
                    ]
                ]
            )
        );
    }

    public function down(Schema $schema): void
    {
        $this->getServiceManager()->unregister(QtiItemContentTokenizer::SERVICE_ID);
    }
}
