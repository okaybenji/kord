#To do:

### iOS native app
* allow playing sound in other apps (Music, Soundcloud) in the background of kord

### Misc
* fix glitchy positioning of etc panel (drops below app at some resolutions in safari)
* fix iOS audio issues (sample rate intermittently 48kHz instead of 44.1, sound dropping out or getting distorted on launch or after switching between tabs/tabs)
* add 3D touch -- multiply vibrato, volume, or cutoff freq * force (see http://freinbichler.me/apps/3dtouch/). let user pick in settings menu.
* fix issue where modifiers get stuck if you touch special and Mm at the same time
* fix settings button not changing color on tap

### Settings panel
* test improving slider ease of use by increasing touchable region without increasing visible size
* make volume & sustain sliders logarithmic
* research subjective loudness of different waveforms and auto-adjust volume to compensate
* due, i think, to sequential linearRamps, dcy=0 causes atk to only get as loud as sustain value; investigate solutions
* persist user settings

### Eventually... (maybe)
* visualize amp's adsr * vol and cutoff's ads * freq
* allow user to define and arrange custom chords
* allow storing patches
* if support is added outside IE, color fill left-hand side of sliders with colors of pressed chords (e.g. dark purple for amp, etc.)
* add transition when opening settings (fade in/out)
* make settings panel swipe up from bottom; replace settings button with swipable (to the right) "key slider" to allow quick & easy key changes on the fly
* add option to show chord letters instead of numbers
* add option for minor mode (w/ sharp 7's)
* add support for sample instruments (piano, guitar, etc.)
* allow modulation of filter cutoff and/or introduction of vibrato while chord playing with drag along x/y axes
* fix sticky slider size on safari (to reproduce, just resize the window)
