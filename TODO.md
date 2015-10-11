#To do:

### Misc
* ensure touching any # of modifiers highlights them blue and special button gets highlighted with yellow font
* shrink main interface just a bit vertically to fit better on iPhone screen
* port to Phonegap

### Settings panel
* fix ugliness on iOS in portrait mode
* make sliders easy to use
* make volume & sustain sliders logarithmic
* research subjective loudness of different waveforms and auto-adjust volume to compensate
* visualize amp's adsr * vol and cutoff's ads * freq
* due, i think, to sequential linearRamps, dcy=0 causes atk to only get as loud as sustain value; investigate solutions
* change key selector to ul and style a la Bootstrap
* either make settings button gear work as plain text, or make a gear SVG and use that for the BG

### Eventually... (maybe)
* add transition when opening settings (fade in/out)
* re-style settings panel
* fix Safari sound distortion (if it still exists?)
* determine how to disable scrolling on iOS Safari
* consider forcing horizontal orientation
* make settings panel swipe up from bottom
* replace settings button with swipable (to the right) "key slider" to allow quick & easy key changes on the fly
* add option to show chord letters instead of numbers
* add option for minor mode (w/ sharp 7's)
* add support for sample instruments (piano, guitar, etc.)
* allow modulation of filter cutoff and/or introduction of vibrato while chord playing with drag along x/y axes