"use client";

import {useEffect, useState} from "react";
import * as Tone from "tone";
import {emptyBuffer, stretchBuffer, concatBuffers} from "@/lib/tone";
import AudioCanvas from "@/components/AudioCanvas";

export default function Home() {
    const [catAudioBuffer, setCatAudioBuffer] = useState<Tone.ToneAudioBuffer | undefined>(undefined);
    const [mineAudioBuffer, setMineAudioBuffer] = useState<Tone.ToneAudioBuffer | undefined>(undefined);

    useEffect(() => {
        const loadSound = async (url: string) => {
            return await Tone.ToneAudioBuffer.fromUrl(url);
        };

        const createCatAudioBuffer = async () => {
            const [bufferCO, bufferCOSecond, bufferCEFirst, bufferCESecond, bufferCA] = await Promise.all(["/co.wav", "/co_second.wav", "/ce_first.wav", "/ce_second.wav", "/ca.wav"].map(loadSound));
            const buffers = [
                await stretchBuffer(bufferCO),
                await stretchBuffer(bufferCEFirst),
                await stretchBuffer(bufferCEFirst),
                await stretchBuffer(bufferCA),
                await stretchBuffer(bufferCEFirst),
                await stretchBuffer(bufferCOSecond),
                emptyBuffer(0.1),
                await stretchBuffer(bufferCESecond),
                await stretchBuffer(bufferCESecond),
                await stretchBuffer(bufferCESecond),
                await stretchBuffer(bufferCESecond),
                await stretchBuffer(bufferCA),
                await stretchBuffer(bufferCESecond),
            ];
            return concatBuffers(buffers);
        };

        const createMineAudioBuffer = async () => {
            const [bufferO, bufferE, bufferA] = await Promise.all(["/o.wav", "/e.wav", "/a.wav"].map(loadSound));
            const buffers = [
                await stretchBuffer(bufferO, 2),
                emptyBuffer(0.08),
                await stretchBuffer(bufferE, 0.7),
                emptyBuffer(0.03),
                await stretchBuffer(bufferE, 0.7),
                await stretchBuffer(bufferA, 2),
                emptyBuffer(0.05),
                await stretchBuffer(bufferE, 0.7),
                await stretchBuffer(bufferO),

                emptyBuffer(0.1),

                await stretchBuffer(bufferE, 0.7),
                emptyBuffer(0.04),
                await stretchBuffer(bufferE, 0.7),
                emptyBuffer(0.04),
                await stretchBuffer(bufferE, 0.7),
                emptyBuffer(0.04),
                await stretchBuffer(bufferE, 0.7),
                await stretchBuffer(bufferA, 2),
                emptyBuffer(0.05),
                await stretchBuffer(bufferE, 0.7),
            ];

            return concatBuffers(buffers);
        };

        createCatAudioBuffer().then(setCatAudioBuffer);
        createMineAudioBuffer().then(setMineAudioBuffer);

        return;
    }, []);

    const playMineConsecutive = async () => {
        if (!mineAudioBuffer) return;

        new Tone.Player(mineAudioBuffer).toDestination().start();
    };

    const playCatConsecutive = async () => {
        if (!catAudioBuffer) return;

        new Tone.Player(catAudioBuffer).toDestination().start();
    };

    return (
        <div
            className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
                <div onClick={playCatConsecutive}>CAT</div>
                <AudioCanvas width={800} height={200} audioBuffer={catAudioBuffer}></AudioCanvas>
                <div onClick={playMineConsecutive}>MINE</div>
                <AudioCanvas width={800} height={200} audioBuffer={mineAudioBuffer}></AudioCanvas>
            </main>
        </div>
    );
}
