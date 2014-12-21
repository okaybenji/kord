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
    
    //defaults
    synth.maxGain = .9; //out of 1
    synth.attack = .1; //in seconds
    synth.decay = 0; //in seconds
    synth.sustain = 1; //out of 1
    synth.release = .8 //in seconds
    synth.glide = 0 //in seconds
    synth.cutoff = filter.frequency;
    synth.cutoff.value = 20000 //low-pass filter cut-off in hertz
    
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
        if (synth.glide && amp.gain.value > 0) {
            var glide = parseFloat(synth.glide);
            oscs[i].frequency.linearRampToValueAtTime(frequency, now + glide);
        } else {
            oscs[i].frequency.setValueAtTime(frequency, now);
        }
    };
    
    //apply attack, decay, sustain envelope
    synth.start = function start() {
        var atk = parseFloat(synth.attack);
        var dec = parseFloat(synth.decay);
        var now = getNow();
        amp.gain.linearRampToValueAtTime(synth.maxGain, now + atk);
        amp.gain.linearRampToValueAtTime(synth.sustain * synth.maxGain, now + atk + dec);
    }
    
    //apply release envelope
    synth.stop = function stop() {
        var rel = parseFloat(synth.release);
        var now = getNow();
        amp.gain.linearRampToValueAtTime(0, now + rel);
    };

    //export
    return synth;

};