import math
import random
import struct
import wave

random.seed(42)
RATE = 44100
DURATION = 47.0
N = int(RATE * DURATION)
transition_times = [3.8, 7.6, 9.6, 13.2, 15.4, 22.4, 25.4, 27.8, 32.2, 36.4, 40.4, 42.6, 44.8]
chords = [
    (110.0, 164.81, 220.0),
    (98.0, 146.83, 196.0),
    (87.31, 130.81, 174.61),
    (98.0, 146.83, 220.0),
]

data = []
for i in range(N):
    t = i / RATE
    chord = chords[int(t // 4.0) % len(chords)]
    pad = sum(math.sin(2 * math.pi * f * t + 0.14 * math.sin(t * 0.37)) for f in chord) / 3
    air = math.sin(2 * math.pi * 440 * t + math.sin(t * 0.19)) * 0.035

    pulse_phase = t % 0.5
    kick = 0.0
    if pulse_phase < 0.17:
        kick = math.sin(2 * math.pi * (62 - 24 * pulse_phase / 0.17) * pulse_phase) * math.exp(-pulse_phase * 24)

    shaker_phase = t % 0.25
    shaker = 0.0
    if shaker_phase < 0.022:
        shaker = (random.random() * 2 - 1) * math.exp(-shaker_phase * 115)

    chime = 0.0
    for marker in transition_times:
        dt = t - marker
        if 0 <= dt < 0.9:
            chime += math.sin(2 * math.pi * 660 * dt) * math.exp(-dt * 4.2)
            chime += 0.45 * math.sin(2 * math.pi * 990 * dt) * math.exp(-dt * 5.0)

    envelope = min(1.0, t / 1.2, max(0.0, (DURATION - t) / 2.0))
    value = envelope * (0.16 * pad + 0.045 * air + 0.16 * kick + 0.028 * shaker + 0.055 * chime)
    value = max(-0.92, min(0.92, value))
    left = int(value * 32767)
    right = int((value * 0.97 + 0.01 * math.sin(2 * math.pi * 0.23 * t)) * 32767)
    data.append(struct.pack('<hh', left, right))

with wave.open('public/soundtrack.wav', 'wb') as wav:
    wav.setnchannels(2)
    wav.setsampwidth(2)
    wav.setframerate(RATE)
    wav.writeframes(b''.join(data))

click_n = int(RATE * 0.18)
click = []
for i in range(click_n):
    t = i / RATE
    value = 0.52 * math.sin(2 * math.pi * 820 * t) * math.exp(-t * 42)
    value += 0.22 * math.sin(2 * math.pi * 1280 * t) * math.exp(-t * 64)
    sample = int(max(-0.9, min(0.9, value)) * 32767)
    click.append(struct.pack('<h', sample))

with wave.open('public/click.wav', 'wb') as wav:
    wav.setnchannels(1)
    wav.setsampwidth(2)
    wav.setframerate(RATE)
    wav.writeframes(b''.join(click))
