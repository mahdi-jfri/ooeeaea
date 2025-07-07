import {Box, TextField} from "@mui/material";
import AudioPlayer from "@/components/AudioPlayer";
import {useCallback, useEffect, useRef, useState} from "react";
import * as Tone from "tone";
import {addBasePath} from "next/dist/client/add-base-path";
import {concatBuffers, emptyBuffer} from "@/lib/tone";
import {compileCode} from "@/lib/compiler/compiler";


export default function CodeAudioPlayer() {
    const [textAudioBuffer, setTextAudioBuffer] = useState<Tone.ToneAudioBuffer | undefined>(undefined);

    const [codeValue, setCodeValue] = useState<string>("");

    const textRef = useRef<HTMLInputElement | null>(null);

    const [errorValue, setErrorValue] = useState<string>("");

    const keepAllowed = (code: string): string => {
        return code;
    };

    const codeLimit = 500;

    const compile = useCallback(async (codeValue: string) => {
        if (!codeValue) {
            setTextAudioBuffer(undefined);
            return;
        }
        let evaluatedCode: string;
        try {
            const {finalResult, compilationErrors} = compileCode(codeValue);
            if (compilationErrors.length > 0) {
                setErrorValue(compilationErrors.map(error => `Line ${error.lineNumber}: ${error.message}`).join("\n"));
                return;
            }
            evaluatedCode = finalResult;
            if (evaluatedCode.length > codeLimit) {
                setErrorValue(`EvaluatedCode must be at most ${codeLimit} characters long.`);
                return;
            }
        } catch (e) {
            console.error(e);
            setErrorValue("Something went wrong");
            return;
        }
        setErrorValue("");
        const [bufferCO, bufferCOSecond, bufferCEFirst, bufferCESecond, bufferCA] = await Promise.all([
            "/co.wav",
            "/co_second.wav",
            "/ce_first.wav",
            "/ce_second.wav",
            "/ca.wav",
        ].map(async (url) => await Tone.ToneAudioBuffer.fromUrl(addBasePath(url))));
        const buffers = [...evaluatedCode].map((ch) => {
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
            } else if (ch === ' ' || ch == '\n') {
                return emptyBuffer(0.1);
            }
        }).filter(e => e !== undefined);
        const buffer = await concatBuffers(buffers);

        setTextAudioBuffer(buffer);
    }, []);

    useEffect(() => {
        if (textRef.current) {
            const startingValue = 'repeat = 2;\ntone = "oeeaeO EEEEaE";\n(repeat + 1) * tone;';
            setCodeValue(startingValue);
            textRef.current.value = startingValue;
            compile(startingValue);
        }
    }, [compile]);

    useEffect(() => {
        const timeoutId = setTimeout(() => compile(codeValue), 100);
        return () => clearTimeout(timeoutId);
    }, [codeValue, compile]);

    return (
        <>
            <Box className="flex flex-row flex-wrap justify-between gap-x-2 gap-y-2 mb-4">
                <TextField
                    multiline
                    slotProps={{
                        htmlInput: {
                            ref: textRef,
                        },
                        formHelperText: {
                            className: "block !text-red-700 line-clamp-3 max-w-[700px] !whitespace-pre-line"
                        }
                    }}
                    minRows={3}
                    maxRows={6}
                    variant="outlined"
                    placeholder={'Write here'}
                    onChange={(e) => {
                        e.preventDefault();
                        const value = keepAllowed(e.target.value);
                        if (textRef.current) textRef.current.value = value;
                        setCodeValue(value);
                    }}
                    helperText={(() => {
                        if (errorValue) {
                            return errorValue;
                        } else {
                            return "";
                        }
                    })()}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            compile(codeValue);
                        }
                    }}
                    sx={{
                        "& .MuiFormHelperText-root": {
                            color: "var(--background)",
                        },
                        "& .MuiOutlinedInput-root": {
                            color: "var(--background)",
                            "& fieldset": {
                                border: "none",
                            },
                            "&.Mui-focused fieldset": {
                                border: "none",
                            },
                            "&:hover fieldset": {
                                border: "none",
                            },
                        },
                    }}
                    className="w-full rounded-lg bg-foreground"
                />
            </Box>
            <AudioPlayer width={800} height={200} audioBuffer={textAudioBuffer}></AudioPlayer>
        </>
    );
}