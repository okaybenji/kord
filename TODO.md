#To do:

### Misc
* add touchStart=on, touchEnd=off to modifiers & chords
* fix Safari sound distortion
* port to Phonegap

### Settings panel
* make volume & sustain sliders logarithmic
* visualize amp's adsr * vol and cutoff's ads * freq
* due, i think, to sequential linearRamps, dcy=0 causes atk to only get as loud as sustain value; investigate solutions
* add transition when opening settings (fade in/out)
* style settings panel
* change key selector to ul and style a la Bootstrap

### Eventually... (maybe)
* make settings panel swipe up from bottom
* replace settings button with swipable (to the right) "key slider" to allow quick & easy key changes on the fly
* add option to show chord letters instead of numbers
* add option for minor mode (w/ sharp 7's)
* add support for sample instruments (piano, guitar, etc.)
* research subjective loudness of different waveforms and auto-adjust volume to compensate
* allow modulation of filter cutoff and/or introduction of vibrato while chord playing with drag along x/y axes