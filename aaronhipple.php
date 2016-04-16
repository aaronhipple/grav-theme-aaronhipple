<?php
namespace Grav\Theme;

require __DIR__ . '/vendor/autoload.php';

use getID3;
use getid3_lib;
use Twig_SimpleFunction;
use Grav\Common\Theme;
use RocketTheme\Toolbox\Event\Event;

class AaronHipple extends Theme
{
    /**
     * @return array
     */
    public static function getSubscribedEvents()
    {
        return [
            'onTwigExtensions' => ['onTwigExtensions', 0],
        ];
    }

    /**
     * Add a twig extension to get some MP3 stuffs
     * @param Event $event
     */
    public function onTwigExtensions(Event $event) {
        $this->grav['twig']->twig()->addFunction(new Twig_SimpleFunction ('getid3', function ($path) {
            $getID3 = new getID3();
            $fileInfo = $getID3->analyze($path);

            getid3_lib::CopyTagsToComments($fileInfo);

            if (isset($fileInfo['error'])) {
                throw new \RuntimeException(sprintf('Error at reading audio properties from "%s" with getID3: %s.', $path, $fileInfo['error']));
            }

            foreach ($fileInfo['comments_html'] as $key => $value) {
                if (is_array($value) && count($value) >= 1) {
                    $fileInfo['comments_html'][$key] = $value[0];
                }
            }

            return $fileInfo;
        }));
    }
}
