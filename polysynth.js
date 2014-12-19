var Polysynth = function() {

    var audioCtx = new webkitAudioContext;
    var oscillators = [];
    var amp = audioCtx.createGain();
    amp.connect(audioCtx.destination);
    amp.gain.value = 0;
    
    var synth = this;
    synth.waveform = 'sine'; //default waveform
    synth.maxGain = .9; //default volume (out of 1)
    synth.attack = .1; //default attack (in seconds)
    synth.release = 1 //default release (in seconds)

    //play a note
    synth.start = function start(frequency) {
        var osc = audioCtx.createOscillator();
        osc.type = synth.waveform;
        oscillators.push(osc);
        osc.connect(amp);
        osc.start(0);
        var now = audioCtx.currentTime;
        osc.frequency.setValueAtTime(frequency, now);
        amp.gain.cancelScheduledValues(now);
        amp.gain.setValueAtTime(amp.gain.value, now);
        amp.gain.linearRampToValueAtTime(synth.maxGain, audioCtx.currentTime + synth.attack); 
    };
    
    //stop the note
    synth.stop = function stop() {
        var now = audioCtx.currentTime;
        amp.gain.cancelScheduledValues(now);
        amp.gain.setValueAtTime(amp.gain.value, now);
        amp.gain.linearRampToValueAtTime(0, audioCtx.currentTime + synth.release);
        for (var i=0, ii=oscillators.length; i++; i<ii) {
            oscillators[i].stop(0);
        }
    };

    //export
    return synth;

};