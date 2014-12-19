var Polysynth = function() {

    var audioCtx = new webkitAudioContext;
    var osc = []; //oscillator array
    var amp = audioCtx.createGain();
    amp.connect(audioCtx.destination);
    amp.gain.value = 0;
    
    var synth = this;
    synth.waveform = 'sine'; //default waveform
    synth.maxGain = .9; //default volume (out of 1)
    synth.attack = .1; //default attack (in seconds)
    synth.release = 1 //default release (in seconds)


    //play note (inaudible without envelope)
    synth.playNote = function start(frequency) {
        var i = osc.length;
        var now = audioCtx.currentTime;
        osc[i] = audioCtx.createOscillator();
        osc[i].type = synth.waveform;
        osc[i].connect(amp);
        osc[i].start(now);
        osc[i].frequency.setValueAtTime(frequency, now);
    };
    
    //apply gain attack envelope
    synth.applyAttack = function applyAttack() {
        var now = audioCtx.currentTime;
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
        //stop oscillators after release
        setTimeout(function() {
            for (var i=0, ii=osc.length; i<ii; i++) {
                console.log('stopping oscillator:',osc[i]);
                osc[i].stop(now);
            }
            osc = [];
        }, synth.release * 1000);
    };

    //export
    return synth;

};