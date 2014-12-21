var Polysynth = function(numVoices) {

    var audioCtx = new webkitAudioContext;
    var oscs = []; //oscillator array
    var amp = audioCtx.createGain();
    var filter = audioCtx.createBiquadFilter();
    amp.gain.value = 0;
    filter.type = 'lowpass';
    filter.connect(amp);
    amp.connect(audioCtx.destination);
    
    var synth = this;
    
    //synth defaults
    synth.maxGain = .9; //out of 1
    synth.attack = .1; //in seconds
    synth.decay = 0; //in seconds
    synth.sustain = 1; //out of 1
    synth.release = .8; //in seconds
    
    //low-pass filter cutoff defaults
    synth.cutoff = filter.frequency;
    synth.cutoff.value = 7500; //in hertz
    synth.cutoff.maxValue = 7500; //in hertz
    //synth.cutoff.contour = 1; //out of 1
    synth.cutoff.attack = .1; //in seconds
    synth.cutoff.decay = .1; //in seconds
    synth.cutoff.sustain = .8; //out of 1
    
    //populate osc array
    for (var i=0; i<numVoices; i++) {
        oscs[i] = audioCtx.createOscillator();
        oscs[i].connect(filter);
        oscs[i].start(0);
    }
    
    function getNow() {
        var now = audioCtx.currentTime;
        amp.gain.cancelScheduledValues(now);
        amp.gain.setValueAtTime(amp.gain.value, now);
        return now;
    }
    
    //change waveform (default: sine)
    synth.setWaveform = function setWaveform(waveform) {
        for (var i=0; i<numVoices; i++) {
            oscs[i].type = waveform;
        }
    }

    //set note pitch for given oscillator
    synth.setPitch = function setPitch(i, frequency) {
        var now = audioCtx.currentTime;
        oscs[i].frequency.setValueAtTime(frequency, now);
    };
    
    //apply attack, decay, sustain envelope
    synth.start = function startSynth() {
        var atk = parseFloat(synth.attack);
        var dec = parseFloat(synth.decay);
        var now = getNow();
        applyCutoff(now);
        amp.gain.linearRampToValueAtTime(synth.maxGain, now + atk);
        amp.gain.linearRampToValueAtTime(synth.sustain * synth.maxGain, now + atk + dec);
    }
    
    //apply release envelope
    synth.stop = function stopSynth() {
        var rel = parseFloat(synth.release);
        var now = getNow();
        amp.gain.linearRampToValueAtTime(0, now + rel);
    };
    
    function applyCutoff(time) {
        var atk = parseFloat(synth.cutoff.attack);
        var dec = parseFloat(synth.cutoff.decay);
        synth.cutoff.cancelScheduledValues(time);
        synth.cutoff.linearRampToValueAtTime(synth.cutoff.value, time);
        synth.cutoff.linearRampToValueAtTime(synth.cutoff.maxValue, time + atk);
        synth.cutoff.linearRampToValueAtTime(synth.cutoff.sustain * synth.cutoff.maxValue, time + atk + dec);
    }

    //export
    return synth;

};