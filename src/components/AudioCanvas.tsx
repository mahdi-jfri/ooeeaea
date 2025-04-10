import {useCallback, useEffect, useRef} from "react";
import * as Tone from "tone";

interface AudioCanvasInput {
    width: number,
    height: number,
    audioBuffer?: Tone.ToneAudioBuffer,
    bgColor?: string,
    lineColor?: string,
    ratio?: number,
    scroll?: number,
    onMovePosition?: (position: number) => void,
};

export default function AudioCanvas({
                                        width,
                                        height,
                                        audioBuffer,
                                        bgColor = "#ffffff",
                                        lineColor = "#0055ae",
                                        ratio = 4,
                                        scroll = 0,
                                        onMovePosition,
                                    }: AudioCanvasInput) {
    const canvasParRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const canvasInnerWidth = Math.min(5000, Math.max(width, Math.floor(audioBuffer?.duration || 0) * 50));
    console.log(canvasInnerWidth);
    const canvasInnerHeight = height;

    const moveScroll = useCallback(() => {
        if (!canvasParRef.current) return;
        canvasParRef.current.scrollLeft = canvasParRef.current.scrollWidth * Math.max(0, scroll - 0.1);
    }, [canvasParRef, scroll])

    const drawWaveform = useCallback(() => {
        if (!canvasRef.current || !audioBuffer) return;

        const canvas: HTMLCanvasElement = canvasRef.current;
        const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

        const w = canvas.width;
        const h = canvas.height;

        const data = audioBuffer.getChannelData(0);
        const step = Math.ceil(data.length / w);
        const amp = h / 2;

        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, w, h);

        ctx.lineWidth = ratio;
        ctx.strokeStyle = lineColor;

        ctx.beginPath();
        for (let i = 0; i < w; i++) {
            const min = Math.min(...data.slice(i * step, (i + 1) * step));
            const max = Math.max(...data.slice(i * step, (i + 1) * step));

            ctx.moveTo(i, amp + min * amp);
            ctx.lineTo(i, amp + max * amp);
        }
        ctx.moveTo(0, amp);
        for (let i = 1; i < w; i++) {
            ctx.lineTo(i, amp);
            ctx.moveTo(i, amp);
        }
        const scrollPosition = w * scroll;
        ctx.moveTo(scrollPosition, 0);
        ctx.lineTo(scrollPosition, h);
        ctx.closePath();
        ctx.stroke();
    }, [canvasRef, audioBuffer, bgColor, lineColor, ratio, scroll]);

    useEffect(() => {
        drawWaveform();
    }, [drawWaveform]);

    useEffect(() => {
        moveScroll();
    }, [moveScroll]);

    const setRef = (ref: HTMLCanvasElement | null) => {
        if (ref) {
            canvasRef.current = ref;
            ref.style.width = canvasInnerWidth + "px";
            ref.style.height = canvasInnerHeight + "px";
            drawWaveform();
        }
    }

    const onClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const target = e.currentTarget;
        const rect = target.getBoundingClientRect();
        const position = (e.clientX - rect.left) / rect.width;
        console.log(position);
        if (onMovePosition)
            onMovePosition(position);
    };

    const setCanvasParRef = (ref: HTMLDivElement | null) => {
        if (ref) {
            canvasParRef.current = ref;
            if (canvasParRef.current.scrollWidth > width)
                ref.style.width = width + "px";
        }
    }

    return (
        <div className="overflow-x-auto border max-w-full" ref={setCanvasParRef}>
            <canvas ref={setRef} width={canvasInnerWidth * ratio} height={canvasInnerHeight * ratio}
                    onClick={onClick}
                    className="border-solid border-foreground"/>
        </div>
    )
};