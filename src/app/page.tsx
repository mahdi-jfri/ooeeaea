"use client";

import {useEffect, useRef, useState} from "react";
import * as Tone from "tone";
import {emptyBuffer, concatBuffers} from "@/lib/tone";
import {addBasePath} from "next/dist/client/add-base-path";
import {TextField} from "@mui/material";
import AudioPlayer from "@/components/AudioPlayer";
import CatAudioPlayer from "@/components/CatAudioPlayer";
import MineAudioPlayer from "@/components/MineAudioPlayer";

export default function Home() {
    const [textAudioBuffer, setTextAudioBuffer] = useState<Tone.ToneAudioBuffer | undefined>(undefined);

    const [codeValue, setCodeValue] = useState<string>("");

    const loadSound = async (url: string) => {
        return await Tone.ToneAudioBuffer.fromUrl(addBasePath(url));
    };

    const textRef = useRef<HTMLInputElement | null>(null);

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
                    <CatAudioPlayer />
                </div>
                <div className="max-w-full">
                    <div>MINE</div>
                    <MineAudioPlayer />
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
