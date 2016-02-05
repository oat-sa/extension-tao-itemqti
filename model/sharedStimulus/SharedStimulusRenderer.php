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

class SharedStimulusRenderer extends ConfigurableService implements MediaRendererInterface
{

    public function __construct(array $options = array())
    {
        parent::__construct($options);
    }

    public function render($mediaLink)
    {
        // TODO: Implement render() method.
        return null;
    }
}