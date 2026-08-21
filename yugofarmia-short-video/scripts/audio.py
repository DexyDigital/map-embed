import math
import random
import struct
import wave

random.seed(21)
RATE = 44100
DURATION = 21.0
N = int(RATE * DURATION)
markers = [2.7, 4.0, 5.1, 6.2, 7.2, 8.6, 9.2, 9.8, 10.4, 11.0, 11.6, 13.6, 16.2, 18.0]
chords = [
    (110.0, 164.81, 220.0),
    (98.0, 146.83, 196.0),
    (87.31, 130.81, 174.61),
    (98.0, 146.83, 220.0),
]

frames = []
for i in range(N):
    t = i / RATE
    chord = chords[int(t // 3.0) % len(chords)]
    pad = sum(math.sin(2 * math.pi * f * t + 0.08 * math.sin(t * 0.41)) for f in chord) / 3
    pulse_phase = t % 0.5
    pulse = 0.0
    if pulse_phase < 0.13:
        pulse = math.sin(2 * math.pi * (70 - 20 * pulse_phase / 0.13) * pulse_phase) * math.exp(-pulse_phase * 27)
    tick_phase = t % 0.25
    tick = 0.0
    if tick_phase < 0.016:
        tick = (random.random() * 2 - 1) * math.exp(-tick_phase * 145)
    chime = 0.0
    for marker in markers:
        dt = t - marker
        if 0 <= dt < 0.55:
            chime += math.sin(2 * math.pi * 720 * dt) * math.exp(-dt * 7.0)
            chime += 0.35 * math.sin(2 * math.pi * 1080 * dt) * math.exp(-dt * 9.0)
    envelope = min(1.0, t / 0.8, max(0.0, (DURATION - t) / 1.4))
    value = envelope * (0.135 * pad + 0.12 * pulse + 0.018 * tick + 0.038 * chime)
    value = max(-0.9, min(0.9, value))
    left = int(value * 32767)
    right = int((value * 0.97 + 0.006 * math.sin(2 * math.pi * 0.21 * t)) * 32767)
    frames.append(struct.pack('<hh', left, right))

with wave.open('public/soundtrack.wav', 'wb') as wav:
    wav.setnchannels(2)
    wav.setsampwidth(2)
    wav.setframerate(RATE)
    wav.writeframes(b''.join(frames))
