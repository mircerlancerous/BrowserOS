# BrowserOS

[Project Page](http://offthebricks.com/?page=programming&sub=projects&item=browseros)
[Try it Out](http://offthebricks.com/pages/programming/browseros/BrowserOS.php)

A desktop-style windowed OS within a web browser. Light-weight, efficient, and written in PHP and JavaScript with hardware acceleration and no external dependencies. Very carefully styled to provide typical dragging to move and resize windows. HTML5 request animationframe is used to smooth movement of the windows. This is NOT designed in any way to be used on a touch device.

![Screen Shot](http://offthebricks.com/pages/programming/browseros/ScreenShot.png)

The goal of this project is to bring desktop style applications to web browsers. The desktop is unrivaled in the area of getting real work done due in part to our ability to access and organize the various web applications available. This project combined with web file storage management like this file browser is a first start. Ideally we'll reach a point of never having to install anything other than drivers and a web browser ever again. Taking this to the next level would be to have desktop apps we still rely on, to be loaded via RemoteApp (or similar) within the web browser. This would truly bring desktop and web applications together for the first time.

The project is in an early proof-of-concept stage at this point. Everything works but there's tons more that could be added and of course made to look nicer. One limitation of some web apps such as email is they're flagged as not being permitted to run in iframes. This OS requires everything to be in iframes so that their native functionality and styling is not affected. To get around this issue there are browser plugins to tell the browser to ignore this restriction.
