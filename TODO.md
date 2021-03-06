#To do:

### Misc
* diagnose and fix iOS audio issues: on load, after switching between tabs or apps, or after inserting or removing headphones/cables into or from audio jack, audio may become heavily distorted (caused by audioContext sample rate of 48k instead of 44.1), become heavily distorted *and* change pitch, or cease to function altogether
* add 3D touch -- multiply vibrato, volume, or cutoff freq * force (see http://freinbichler.me/apps/3dtouch/). let user pick (or disable) in settings menu.

### Eventually... (maybe)
* build Android app and test Web Audio; may need to `ionic add browser crosswalk`
* visualize amp's adsr \* vol and cutoff's ads \* freq
* allow user to define and arrange custom chords
* allow storing patches
* allow user to add custom waveforms
* clean up modifier code
* in cases where Mm and special modifiers are both 'on', consider making the inactive button gray or dark blue
* test improving slider ease of use by increasing touchable region without increasing visible size
* fix glitchy positioning of etc panel in safari (gap at some resolutions due to 2/3vw)
* if support is added outside IE, color fill left-hand side of sliders with colors of pressed chords (e.g. dark purple for amp, etc.)
* add transition when opening settings (fade in/out)
* make settings panel swipe up from bottom; replace settings button with swipable (to the right) "key slider" to allow quick & easy key changes on the fly
* add option to show chord letters instead of numbers
* add option for minor mode (w/ sharp 7's)
* add support for sample instruments (piano, guitar, etc.)
* allow modulation of filter cutoff and/or introduction of vibrato while chord playing with drag along x/y axes
* fix sticky slider size on safari (to reproduce, just resize the window)
