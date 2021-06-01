<?php

/**
 * DownloadSampleCsv Controller provide actions to download sample CSV
 *
 * @author Chinnu Francis - TAO Team - {@link http://www.tao.lu}
 * @package taoQtiItem
 * @license GPLv2  http://www.opensource.org/licenses/gpl-2.0.php
 */

namespace oat\taoQtiItem\controller;

use oat\taoQtiItem\model\import\SampleTemplateDownload;
use tao_actions_CommonModule;

/**
 * DownloadSampleCsv Controller provide actions to download sample CSV
 *
 * @author Chinnu Francis - TAO Team - {@link http://www.tao.lu}
 * @package taoQtiItem

 * @license GPLv2  http://www.opensource.org/licenses/gpl-2.0.php
 */
class ItemImportSampleDownload extends tao_actions_CommonModule
{
    public function downloadTemplate()
    {
        return $this->getSampleTemplateDownload()->download($this->getPsrRequest(), $this->getPsrResponse());
    }

    private function getSampleTemplateDownload(): SampleTemplateDownload
    {
        return $this->getServiceLocator()->get(SampleTemplateDownload::class);
    }
}
