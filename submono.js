/*!
 *  submono - a Web Audio subtractive, monophonic synthesizer
 *  (c) 2015 Benji Kay
 *  MIT License
 */

/*
 * TODO: Explore synth.cutoff.contour.
 */

var Monosynth = function Monosynth(audioCtx, config) {

  var Synth = function Synth() {
    config = config || {};
    config.cutoff = config.cutoff || {};

    var synth = this;

    synth.audioCtx = audioCtx,
    synth.amp      = audioCtx.createGain(),
    synth.filter   = audioCtx.createBiquadFilter(),
    synth.osc      = audioCtx.createOscillator(),
    synth.pan      = audioCtx.createPanner(),

    synth.maxGain  = config.maxGain  || 0.9, // out of 1
    synth.attack   = config.attack   || 0.1, // in seconds
    synth.decay    = config.decay    || 0.0, // in seconds
    synth.sustain  = config.sustain  || 1.0, // out of 1
    synth.release  = config.release  || 0.8, // in seconds

    //low-pass filter
    synth.cutoff              = synth.filter.frequency;
    synth.cutoff.maxFrequency = config.cutoff.maxFrequency || 7500; // in hertz
    synth.cutoff.attack       = config.cutoff.attack       || 0.1; // in seconds
    synth.cutoff.decay        = config.cutoff.decay        || 2.5; // in seconds
    synth.cutoff.sustain      = config.cutoff.sustain      || 0.2; // out of 1
    
    synth.amp.gain.value = 0;
    synth.filter.type = 'lowpass';
    synth.filter.connect(synth.amp);
    synth.amp.connect(audioCtx.destination);
    synth.pan.panningModel = 'equalpower';
    synth.pan.setPosition(0, 0, 1); // start with stereo image centered
    synth.osc.connect(synth.pan);
    synth.pan.connect(synth.filter);
    synth.osc.start(0);
    
    synth.waveform(config.waveform || 'sine');
    synth.pitch(config.pitch || 440);

    return synth;
  };

  function getNow() {
    var now = this.audioCtx.currentTime;
    this.amp.gain.cancelScheduledValues(now);
    this.amp.gain.setValueAtTime(this.amp.gain.value, now);
    return now;
  };
  
  Synth.prototype.pitch = function pitch(newPitch) {
    if (newPitch) {
      var now = this.audioCtx.currentTime;
      this.osc.frequency.setValueAtTime(newPitch, now);
    }
    return this.osc.frequency.value;
  };

  Synth.prototype.waveform = function waveform(newWaveform) {
    if (newWaveform) {
      this.osc.type = newWaveform;
    }
    return this.osc.type;
  };

  //apply attack, decay, sustain envelope
  Synth.prototype.start = function startSynth() {
    var atk  = parseFloat(this.attack);
    var dec  = parseFloat(this.decay);
    var cAtk = parseFloat(this.cutoff.attack);
    var cDec = parseFloat(this.cutoff.decay);
    var now  = getNow.bind(this)();
    this.cutoff.cancelScheduledValues(now);
    this.cutoff.linearRampToValueAtTime(this.cutoff.value, now);
    this.cutoff.linearRampToValueAtTime(this.cutoff.maxFrequency, now + cAtk);
    this.cutoff.linearRampToValueAtTime(this.cutoff.sustain * this.cutoff.maxFrequency, now + cAtk + cDec);
    this.amp.gain.linearRampToValueAtTime(this.maxGain, now + atk);
    this.amp.gain.linearRampToValueAtTime(this.sustain * this.maxGain, now + atk + dec);
  };

  //apply release envelope
  Synth.prototype.stop = function stopSynth() {
    var rel = parseFloat(this.release);
    var now = getNow.bind(this)();
    this.amp.gain.linearRampToValueAtTime(0, now + rel);
  };

  return new Synth;
};
