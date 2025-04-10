"use client";

import {useEffect, useRef, useState} from "react";
import * as Tone from "tone";
import {emptyBuffer, stretchBuffer, concatBuffers} from "@/lib/tone";
import {addBasePath} from "next/dist/client/add-base-path";
import {TextField} from "@mui/material";
import AudioPlayer from "@/components/AudioPlayer";

export default function Home() {
    const [catAudioBuffer, setCatAudioBuffer] = useState<Tone.ToneAudioBuffer | undefined>(undefined);
    const [mineAudioBuffer, setMineAudioBuffer] = useState<Tone.ToneAudioBuffer | undefined>(undefined);
    const [textAudioBuffer, setTextAudioBuffer] = useState<Tone.ToneAudioBuffer | undefined>(undefined);

    const [codeValue, setCodeValue] = useState<string>("");

    const loadSound = async (url: string) => {
        return await Tone.ToneAudioBuffer.fromUrl(addBasePath(url));
    };

    const textRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
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

    useEffect(() => {
        if (!textRef.current) return;
        textRef.current.value = codeValue;
    }, [codeValue]);

    const changeCodeValue = async (codeValue: string) => {
        const [bufferCO, bufferCOSecond, bufferCEFirst, bufferCESecond, bufferCA] = await Promise.all(["/co.wav", "/co_second.wav", "/ce_first.wav", "/ce_second.wav", "/ca.wav"].map(loadSound));
        const buffers = [...codeValue].map((ch) => {
            if (ch === 'o') {
                return bufferCO;
            } else if (ch === 'O') {
                return bufferCOSecond;
            } else if (ch === 'e') {
                return bufferCEFirst;
            } else if (ch === 'E') {
                return bufferCESecond;
            } else if (ch === 'a') {
                return bufferCA;
            } else if (ch === ' ') {
                return emptyBuffer(0.05);
            }
        }).filter(e => e !== undefined);
        const buffer = await concatBuffers(buffers);

        setTextAudioBuffer(buffer);
        setCodeValue(codeValue);
    };

    return (
        <>
            <main
                className="flex flex-col mx-auto p-5 gap-y-8 items-start sm:items-center font-[family-name:var(--font-geist-sans)]">
                <div className="max-w-full">
                    <div className="text-left">CAT</div>
                    <AudioPlayer width={800} height={200} audioBuffer={catAudioBuffer}></AudioPlayer>
                </div>
                <div className="max-w-full">
                    <div>MINE</div>
                    <AudioPlayer width={800} height={200} audioBuffer={mineAudioBuffer}></AudioPlayer>
                </div>
                <div className="max-w-full">
                    <TextField
                        multiline
                        slotProps={{htmlInput: {ref: textRef}}}
                        minRows={3}
                        maxRows={6}
                        variant="outlined"
                        placeholder={'Write here'}
                        onChange={(e) => {
                            e.preventDefault();
                            setCodeValue(e.target.value);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                changeCodeValue(codeValue);
                            }
                        }}
                        className="w-full border rounded-lg bg-foreground"
                    />
                    <AudioPlayer width={800} height={200} audioBuffer={textAudioBuffer}></AudioPlayer>
                </div>
            </main>
        </>
    );
}
