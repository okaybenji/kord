#To do:

### Misc
* add 3D touch -- multiply vibrato, volume, or cutoff freq * force (see http://freinbichler.me/apps/3dtouch/). let user pick in settings menu.

### Settings panel
* fix ugliness on iOS in portrait mode
* customize look of key selector
* prevent slider values from changing width of their cells when their length changes
* fix spacing between amp/cutoff and oscillator divs (should match spacing between amp and cutoff)
* make waveform menu render at correct width on any size viewport
* make volume & sustain sliders logarithmic
* research subjective loudness of different waveforms and auto-adjust volume to compensate
* due, i think, to sequential linearRamps, dcy=0 causes atk to only get as loud as sustain value; investigate solutions
* change key selector to ul and style a la Bootstrap

### Eventually... (maybe)
* visualize amp's adsr * vol and cutoff's ads * freq
* allow user to define and arrange custom chords
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
