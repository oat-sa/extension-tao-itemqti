<?php
/**
 * Created by Antoine on 03/02/2016
 * at 13:12
 */

namespace oat\taoQtiItem\model\sharedStimulus;


use oat\oatbox\event\Event;
use oat\oatbox\service\ConfigurableService;
use oat\oatbox\service\ServiceManager;
use oat\tao\model\media\MediaRendererInterface;
use oat\taoMediaManager\model\fileManagement\FileManagement;
use oat\taoMediaManager\model\MediaSource;
use oat\taoMediaManager\model\rendering\BaseRenderer;

class SharedStimulusRenderer extends BaseRenderer implements MediaRendererInterface
{

    public function __construct(array $options = array())
    {
        parent::__construct($options);
    }

    public function render($mediaLink)
    {
        $mediaSource = new MediaSource(array());
        $fileInfo = $mediaSource->getFileInfo($mediaLink);
        if($fileInfo['mime'] === 'application/qti+xml'){
            //do stuff
            $link = $fileInfo['link'];
            $fileManagement = $this->getServiceManager()->get(FileManagement::SERVICE_ID);
            \tao_helpers_Http::returnStream($fileManagement->getFileStream($link), $fileManagement->getFileSize($link));
        }
        else{
            parent::render($mediaLink);
        }

    }
}