let polysynth;
let settings;

// toggles
let invertMode = false;
let invertChord = false;
let specialChord = false;

const scale = (num, inMin, inMax, outMin, outMax) =>
  (num - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;

const labels = (() => {
  const FLAT = '<span class="accidental">\u266D</span>';
  const SHARP = '<span class="accidental">\u266F</span>';
  const DIM = '\u00B0';
  const AUG = '+';

  const labels = [
    { number: 1, basic: 'I', invertMode: 'i', specialChord: 'I' + AUG },
    { number: 2, basic: 'ii', invertMode: 'II', specialChord: 'ii' + DIM },
    { number: 3, basic: 'iii', invertMode: 'III', specialChord: 'VI' + FLAT },
    { number: 4, basic: 'IV', invertMode: 'iv', specialChord: 'iv' + SHARP + DIM },
    { number: 5, basic: 'V', invertMode: 'v', specialChord: 'v' + SHARP + DIM },
    { number: 6, basic: 'vi', invertMode: 'VI', specialChord: 'VII' + FLAT }
  ];

  return labels;
})();

const waveforms = ['sine', 'square', 'triangle', 'sawtooth'];

// ui handlers
const updateModifier = function updateModifier(modifier, on) {
  const INV = '\u2076';

  // get label for the button for a given chord number
  const getLabel = (chordNumber) => {
    const chordLabels = labels[chordNumber - 1];
    let label = invertMode ? chordLabels.invertMode
    : specialChord ? chordLabels.specialChord
    : chordLabels.basic;

    if (invertChord) {
      label += INV; // add 6 as superscript
    }

    return label;
  };

  let modifiers;
  if (typeof on === 'undefined') {
    $('#' + modifier).toggleClass('on');
    modifiers = {
      Mm() {
        specialChord = false;
        $('#special').removeClass('on');
        invertMode = !invertMode;
      },
      x6() {
        invertChord = !invertChord;
      },
      special() {
        invertMode = false;
        $('#Mm').removeClass('on');
        specialChord = !specialChord;
      }
    };
  } else if (on === true) {
    modifiers = {
      Mm() {
        specialChord = false;
        invertMode = true;
      },
      x6() {
        invertChord = true;
      },
      special() {
        invertMode = false;
        specialChord = true;
      }
    };
    $('#' + modifier).addClass('on');
  } else {
    modifiers = {
      Mm() {
        invertMode = false;
        if ($('#special').hasClass('on')) {
          updateModifier('special', true);
        }
      },
      x6() {
        invertChord = false;
      },
      special() {
        specialChord = false;
        if ($('#Mm').hasClass('on')) {
          updateModifier('Mm', true);
        }
      }
    };
    $('#' + modifier).removeClass('on');
  }
  modifiers[modifier]();

  // update chord labels
  labels.forEach((chord) => {
    $('#chord' + chord.number).html(getLabel(chord.number));
  });

  // resize chord labels to fit inside buttons
  const newClass =
    !specialChord && !invertChord ? 'trenta'
    : invertChord && !specialChord ? 'venti'
    : specialChord && !invertChord ? 'grande'
    : 'tall';

  $('main').attr('class', newClass);
};

const toggleSettings = () => {
  $('#settingsPanel').toggleClass('hidden');
  $('#instrument').toggleClass('hidden');
  $('.settings').toggleClass('on');
};

const saveSettings = (newSettings) => {
  // TODO: since this is called on input, debounce to limit number of times we access storage
  const settings = JSON.parse(localStorage.getItem('settings'));
  Object.assign(settings, newSettings);
  localStorage.setItem('settings', JSON.stringify(settings));
};

const setVolume = (newVolume) => {
  newVolume = Number(newVolume);
  // adjust gain for human logarithmic hearing
  let gain = Math.pow(newVolume, 2);
  // adjust gain for perceived loudness of different waveforms
  const waveform = polysynth.voices[0].waveform();
  waveform === 'square' ? gain *= 0.65
  : waveform === 'sawtooth' ? gain *= 0.85
  : waveform === 'sine' ? gain *= 0.95
  : gain *= 1;

  polysynth.maxGain(gain);
  const volumeText = (newVolume * 100).toFixed(0);
  $('#volumeLabel').text(volumeText);
  saveSettings({volume: newVolume});
};

const setAttack = (newAttack) => {
  newAttack = Number(newAttack);
  polysynth.attack(newAttack);
  const attackText = (newAttack * 1000).toFixed(0);
  $('#attackLabel').text(attackText);
  saveSettings({attack: newAttack});
};

const setDecay = (newDecay) => {
  newDecay = Number(newDecay);
  polysynth.decay(newDecay);
  const decayText = (newDecay * 1000).toFixed(0);
  $('#decayLabel').text(decayText);
  saveSettings({decay: newDecay});
};

const setSustain = (newSustain) => {
  newSustain = Number(newSustain);
  const adjustedSustain = Math.pow(newSustain, 2);
  polysynth.sustain(adjustedSustain);
  const sustainText = (newSustain * 1).toFixed(2);
  $('#sustainLabel').text(sustainText);
  saveSettings({sustain: newSustain});
};

const setRelease = (newRelease) => {
  newRelease = Number(newRelease);
  polysynth.release(newRelease);
  const releaseText = (newRelease * 1000).toFixed(0);
  $('#releaseLabel').text(releaseText);
  saveSettings({release: newRelease});
};

const cutoff = {
  setMaxFrequency(newMaxFrequency) {
    newMaxFrequency = Number(newMaxFrequency);
    polysynth.cutoff.maxFrequency(newMaxFrequency);
    const maxFrequencyText = newMaxFrequency;
    $('#cutoffMaxFrequencyLabel').text(maxFrequencyText);
    saveSettings({cutoff: {maxFrequency: newMaxFrequency}});
  },
  setAttack(newAttack) {
    newAttack = Number(newAttack);
    polysynth.cutoff.attack(newAttack);
    const attackText = (newAttack * 1000).toFixed(0);
    $('#cutoffAttackLabel').text(attackText);
    saveSettings({cutoff: {attack: newAttack}});
  },
  setDecay(newDecay) {
    newDecay = Number(newDecay);
    polysynth.cutoff.decay(newDecay);
    const decayText = (newDecay * 1000).toFixed(0);
    $('#cutoffDecayLabel').text(decayText);
    saveSettings({cutoff: {decay: newDecay}});
  },
  setSustain(newSustain) {
    newSustain = Number(newSustain);
    polysynth.cutoff.sustain(newSustain);
    const sustainText = (newSustain * 1).toFixed(2);
    $('#cutoffSustainLabel').text(sustainText);
    saveSettings({cutoff: {sustain: newSustain}});
  }
};

const setKey = (newKey) => {
  settings.key = newKey = Number(newKey);

  const getKeyLabel = () => {
    const keys = [
      { label: 'G', value: 35 },
      { label: 'G#', value: 36 },
      { label: 'A', value: 37 },
      { label: 'A#', value: 38 },
      { label: 'B', value: 39 },
      { label: 'C', value: 40 },
      { label: 'C#', value: 41 },
      { label: 'D', value: 42 },
      { label: 'D#', value: 43 },
      { label: 'E', value: 44 },
      { label: 'F', value: 45 },
      { label: 'F#', value: 46 }
    ];
    const key = keys.find(k => k.value === newKey);

    return key.label;
  };

  const keyText = getKeyLabel();
  $('#keyLabel').text(keyText);
  saveSettings({key: newKey});
};

const setOctave = (newOctave) => {
  settings.octave = newOctave = Number(newOctave);
  const octaveText = newOctave > 0 ? '+' + newOctave : newOctave;
  $('#octaveLabel').text(octaveText);
  saveSettings({octave: newOctave});
};

const setWidth = (newWidth) => {
  newWidth = Number(newWidth);
  polysynth.width(newWidth);
  const widthText = (newWidth * 100).toFixed(0);
  $('#widthLabel').text(widthText);
  saveSettings({stereoWidth: newWidth});
};

const setBendRange = (newBendRange) => {
  settings.bendRange = newBendRange = Number(newBendRange);
  $('#bendLabel').text(newBendRange);
  saveSettings({bendRange: newBendRange});
};

const setWaveform = (newWaveform) => {
  polysynth.waveform(newWaveform);
  setVolume($('#volumeSlider').val()); // adjust for perceived loudness of waveform
  waveforms.forEach(function(waveform) {
    $('#' + waveform + 'Button').removeClass('on');
  });
  $('#' + newWaveform + 'Button').addClass('on');
  saveSettings({waveform: newWaveform});
};

// reload page w/o POST
const panic = () => {
  window.location = window.location;
};

// initialize synth, controls and control panel
(() => {
  // click anywhere in the page to enable sound
  document.onclick = () => audioCtx.resume();

  const getAudioContext = () =>
    typeof AudioContext === 'undefined' ? new webkitAudioContext() : new AudioContext();

  let audioCtx = getAudioContext();

  // support external midi devices
  // last-note priority with 5 voices
  let voiceIndex = -1;
  const nextVoice = () => {
    voiceIndex = voiceIndex === 4 ? 0 : voiceIndex + 1;
    return voiceIndex;
  }

  navigator.requestMIDIAccess()
    .then((midi) => {
      const handleMsg = (msg) => {
        const [cmd] = msg.data;
        const round = val => val.toFixed(2);
        const frequency = note => Math.pow(2, (note - 69) / 12) * 440;
        const normalize = val => val / 127;
        // command range represents 16 channels
        const command =
          cmd >= 128 && cmd < 144 ? 'off'
          : cmd >= 144 && cmd < 160 ? 'on'
          : cmd >= 224 && cmd < 240 ? 'pitch'
          : cmd >= 176 && cmd < 192 ? 'ctrl'
          : 'unknown';

        const exec = {
          off() {
            const [, note, velocity] = msg.data;
            polysynth.voices
              .filter(v => v.note === note + (settings.octave * 12))
              .forEach(v => v.stop());
          },
          on() {
            const [, note, velocity] = msg.data;
            const octave = settings.octave * 12;
            const voiceIndex = nextVoice();
            const voice = polysynth.voices[voiceIndex];
            voice.pitch(frequency(note + octave));
            voice.note = note + octave;
            voice.start();
          },
          pitch() {
            const [, , strength] = msg.data;
            const mappedStrength = scale(strength, 0, 127, -1, 1) * settings.bendRange / 12;
            const multiplier = Math.pow(2, mappedStrength);

            polysynth.voices.forEach(v => v.note && v.pitch(frequency(v.note) * multiplier));
          },
          ctrl() {
            // controllers such as mod wheel, aftertouch, breath add vibrato
            const [, , strength] = msg.data;
            polysynth.lfo.depth(normalize(strength) * 10);
          },
          unknown() {}
        };

        exec[command]();
      };

      for (const input of midi.inputs.values()) {
        input.onmidimessage = handleMsg;
      }

      midi.onstatechange = () => console.log(`${midi.inputs.size} MIDI device(s) connected`);
    }, () => {
      console.log('Failed to access MIDI');
    });

  // enable sound on mobile systems like iOS; code from Howler.js
  (() => {
    if (audioCtx !== 44100) {
      audioCtx.close();
      audioCtx = getAudioContext();
    }

    const scratchBuffer = audioCtx.createBuffer(1, 1, 22050);

    const unlock = () => {
      const source = audioCtx.createBufferSource();
      source.buffer = scratchBuffer;
      source.connect(audioCtx.destination);

      source.start === 'undefined' ? source.noteOn(0) : source.start(0);

      source.onended = () => {
        source.disconnect(0);
        document.removeEventListener('touchend', unlock, true);
      };
    };

    document.addEventListener('touchend', unlock, true);
  })();

  const getSettings = () => {
    let settings = JSON.parse(localStorage.getItem('settings'));
    if (!settings) {
      // load and save defaults
      settings = {
        key: 40, // C
        octave: -1,
        bendRange: 2, // In semitones
        waveform: 'sawtooth',
        volume: 0.9,
        numVoices: 5,
        stereoWidth: 1,
        attack: 0.28,
        decay: 0.28,
        sustain: 1,
        release: 0.28,
        cutoff: {
          maxFrequency: 1800,
          attack: 0.1,
          decay: 2.5,
          sustain: 0.2
        }
      };
      localStorage.setItem('settings', JSON.stringify(settings));
    }
    return settings;
  };

  settings = getSettings();
  polysynth = new Polysynth(audioCtx, settings);

  // update controls to display initial synth values
  $('#keySlider').val(settings.key); // not a subpoly or submono property
  $('#octaveSlider').val(settings.octave); // not a subpoly or submono property
  $('#widthSlider').val(polysynth.width());
  $('#bendSlider').val(settings.bendRange); // not a subpoly or submono property

  const voice = polysynth.voices[0];
  $('#volumeSlider').val(settings.volume); // volume != gain
  $('#attackSlider').val(voice.attack);
  $('#decaySlider').val(voice.decay);
  $('#sustainSlider').val(voice.sustain);
  $('#releaseSlider').val(voice.release);
  $('#cutoffFrequencySlider').val(voice.cutoff.maxFrequency);
  $('#cutoffAttackSlider').val(voice.cutoff.attack);
  $('#cutoffDecaySlider').val(voice.cutoff.decay);
  $('#cutoffSustainSlider').val(voice.cutoff.sustain);
  $('#waveformSelect').val(voice.waveform());

  // update labels to display initial synth values
  $('#settingsPanel input').trigger('input');
  $('#settingsPanel select').change();

  // prevent browser default behavior on touch/click of buttons
  $('button').on('touchstart mousedown', (e) => {
    e.preventDefault();
  });

  // build chord menu
  (() => {
    let lastChord = 1; // track last-pressed chord button

    // determine chord to play and start playing it
    const start = (chordNumber) => {

      let root = settings.key; // set root based on selected key
      lastChord = chordNumber; // capture last-pressed chord number
      const chord = [];

      $('#chord' + chordNumber).addClass('on');

      const setChord = (root, quality = 'major') => {
        chord[0] = root - 24;
        chord[1] = root - 12;
        chord[2] = root;

        const applyQuality = {
          major() {
            chord[3] = root + 4;
            chord[4] = root + 7;
          },
          minor() {
            chord[3] = root + 3;
            chord[4] = root + 7;
          },
          diminished() {
            chord[3] = root + 3;
            chord[4] = root + 6;
          },
          augmented() {
            chord[3] = root + 4;
            chord[4] = root + 8;
          }
        };

        applyQuality[quality]();
      };

      // shift all notes to first inversion
      const invert = (chord) => {
        chord[2] = chord[3];
        chord[3] = chord[4];
        chord[4] = chord[1] + 24;
        chord[0] = chord[2] - 24;
        chord[1] = chord[2] - 12;
      };

      const chordNumbers = {
        1() {
          if (specialChord) {
            setChord(root, 'augmented');
          } else if (invertMode) {
            setChord(root, 'minor');
          } else {
            setChord(root);
          }
        },
        2() {
          root += 2;
          if (specialChord) {
            setChord(root, 'diminished');
          } else if (!invertMode) {
            setChord(root, 'minor');
          } else {
            setChord(root);
          }
        },
        3() {
          root += 4;
          if (specialChord) {
            setChord(root + 4); // VI flat; weird, i know, but this chord is just more useful
          } else if (!invertMode) {
            setChord(root, 'minor');
          } else {
            setChord(root);
          }
        },
        4() {
          root += 5;
          if (specialChord) {
            root += 1;
            setChord(root, 'diminished');
          } else if (invertMode) {
            setChord(root, 'minor');
          } else {
            setChord(root);
          }
        },
        5() {
          root += 7;
          if (specialChord) {
            root += 1;
            setChord(root, 'diminished');
          } else if (invertMode) {
            setChord(root, 'minor');
          } else {
            setChord(root);
          }
        },
        6() {
          root += 9;
          if (specialChord) {
            root += 1;
            setChord(root);
          } else if (!invertMode) {
            setChord(root, 'minor');
          } else {
            setChord(root);
          }
        },
      };

      chordNumbers[chordNumber]();

      if (invertChord) {
        invert(chord);
      }

      // trigger one note per oscillator
      polysynth.voices.forEach((voice, i) => {
        // get the frequency in hertz of a given piano key
        const getFreq = pianoKey => Math.pow(2, (pianoKey-49)/12) * 440;
        const pianoKey = chord[i] + (settings.octave * 12);
        voice.pitch(getFreq(pianoKey));
        voice.note = pianoKey + 20; // map piano key to MIDI value
      });

      // apply attack gain envelope
      polysynth.start();
    };

    // stop all oscillators if stop command came from last-pressed chord button
    const stop = (chordNumber) => {
      $('#chord' + chordNumber).removeClass('on');
      if (chordNumber === lastChord) {
        polysynth.stop();
      }
    };

    labels.forEach((chord) => {
      const chordMenu = $('#chordMenu');

      const startChord = (e) => {
        e.preventDefault();
        polysynth.lfo.depth(0); // reset lfo depth
        start(chord.number);
      };

      const stopChord = (e) => {
        e.preventDefault();
        stop(chord.number);
      };

      // set lfo depth based on touch pressure
      var updateLfo = function updateLfo(e) {
        e.preventDefault();
        var touches = e.touches || e.originalEvent.touches || e.originalEvent.changedTouches;
        if (!touches) {
          return;
        }
        var touchForce = touches[0].force || 0;
        var forceMultiplier = 10; // what to multiply force by to get appropriate lfo depth
        polysynth.lfo.depth(touchForce * forceMultiplier);
      };

      $('<button/>', {
        id: 'chord' + chord.number,
        text: chord.basic,
        mousedown: startChord,
        mouseup: stopChord })
        .bind('touchstart', startChord)
        .bind('touchend', stopChord)
        .bind('touchmove', updateLfo)
        .appendTo(chordMenu)
      ;
    });

    // set up keyboard listeners
    (() => {
      const keyHandler = (event) => {
        if (!event.repeat) { // ignore repeat keystrokes when holding down keys
          switch (event.keyCode) {
            case 16: // shift
            case 81: // Q
              switch (event.type) {
                case 'keydown':
                  updateModifier('Mm', true);
                  break;
                case 'keyup':
                  updateModifier('Mm', false);
                  break;
              }
              break;
            case 17: // control
            case 65: // A
              switch (event.type) {
                case 'keydown':
                  updateModifier('x6', true);
                  break;
                case 'keyup':
                  updateModifier('x6', false);
                  break;
              }
              break;
            case 18: // alt
            case 90: // Z
              switch (event.type) {
                case 'keydown':
                  updateModifier('special', true);
                  break;
                case 'keyup':
                  updateModifier('special', false);
                  break;
              }
              break;
            case 49: // 1
            case 87: // W
              event.type === 'keydown' ? start(1) : stop(1);
              break;
            case 50: // 2
            case 69: // E
              event.type === 'keydown' ? start(2) : stop(2);
              break;
            case 51: // 3
            case 82: // R
              event.type === 'keydown' ? start(3) : stop(3);
              break;
            case 52: // 4
            case 83: // S
              event.type === 'keydown' ? start(4) : stop(4);
              break;
            case 53: // 5
            case 68: // D
              event.type === 'keydown' ? start(5) : stop(5);
              break;
            case 54: // 6
            case 70: // F
              event.type === 'keydown' ? start(6) : stop(6);
              break;
          }
        }
      };

      document.addEventListener('keydown', keyHandler);
      document.addEventListener('keyup', keyHandler);
    })();
  })();

  // build waverform menu
  (() => {
    const settingsButton = $('#waveformMenu .settings');
    const preventDefault = (e) => {
      e.preventDefault();
    };

    waveforms.forEach((waveform) => {
      const selectWaveform = (e) => {
        e.preventDefault();
        setWaveform(waveform);
      };

      $('<button/>', {
        id: waveform + 'Button',
        html: '&nbsp;',
        mousedown: preventDefault,
        click: selectWaveform
      })
        .bind('touchstart', preventDefault)
        .bind('touchend', selectWaveform)
        .insertBefore(settingsButton)
      ;
    });
    $('#' + settings.waveform + 'Button').click();
  })();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('./serviceWorker.js')
      .catch((err) => {
        console.log(err);
      });
  }
})();
