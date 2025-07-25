import React, {useCallback, useEffect, useRef, useState} from "react";
import * as Tone from "tone";

interface AudioCanvasInput {
    width: number,
    height: number,
    audioBuffer?: Tone.ToneAudioBuffer,
    bgColor?: string,
    ratio?: number,
    scroll?: number,
    onMovePosition?: (position: number) => void,
}

function AudioCanvas({
                         width,
                         height,
                         audioBuffer,
                         ratio = 2,
                         scroll = 0,
                         onMovePosition,
                     }: AudioCanvasInput) {
    const canvasParRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [cachedCanvas, setCachedCanvas] = useState<HTMLCanvasElement | null>(null);

    const canvasInnerWidth = Math.min(5000, Math.max(width, Math.floor(audioBuffer?.duration || 0) * 100));
    const canvasInnerHeight = height;

    useEffect(() => {
        const canvas = document.createElement("canvas");
        canvas.width = canvasInnerWidth * ratio;
        canvas.height = canvasInnerHeight * ratio;
        const ctx = canvas.getContext("2d", {alpha: false}) as CanvasRenderingContext2D;
        const w = canvas.width;
        const h = canvas.height;

        const data = audioBuffer?.getChannelData(0) || [];
        const downsampleSize = 16;
        const step = Math.ceil(Math.ceil(data.length / downsampleSize) / w);
        const amp = h / 2;

        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-foreground').trim();
        ctx.fillRect(0, 0, w, h);

        ctx.lineWidth = ratio;
        ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim();

        ctx.beginPath();
        for (let i = 0; i < w; i++) {
            const startIndex = i * step;
            const endIndex = Math.min(startIndex + step, data.length);

            if (startIndex >= endIndex) continue;

            let min = data[startIndex * downsampleSize];
            let max = data[startIndex * downsampleSize];

            for (let j = startIndex + 1; j < endIndex; j++) {
                const value = data[j * downsampleSize];
                if (value < min) {
                    min = value;
                }
                if (value > max) {
                    max = value;
                }
            }

            ctx.moveTo(i, amp + min * amp);
            ctx.lineTo(i, amp + max * amp);
        }
        ctx.moveTo(0, amp);
        ctx.lineTo(w, amp);
        ctx.stroke();
        setCachedCanvas(canvas);
    }, [audioBuffer, canvasInnerHeight, canvasInnerWidth, ratio]);

    useEffect(() => {
        if (!canvasParRef.current) return;
        canvasParRef.current.scrollLeft = canvasParRef.current.scrollWidth * Math.max(0, scroll - 0.1);
    }, [canvasParRef, scroll])

    const drawWaveform = useCallback(() => {
        if (!canvasRef.current || !cachedCanvas) return;

        const canvas: HTMLCanvasElement = canvasRef.current;
        const ctx = canvas.getContext("2d", {alpha: false}) as CanvasRenderingContext2D;
        ctx.drawImage(cachedCanvas, 0, 0);

        const w = canvas.width;
        const h = canvas.height;

        const scrollPosition = w * scroll;
        ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim();
        ctx.lineWidth = ratio;
        ctx.beginPath();
        ctx.moveTo(scrollPosition, 0);
        ctx.lineTo(scrollPosition, h);
        ctx.closePath();
        ctx.stroke();
    }, [cachedCanvas, ratio, scroll]);

    const setRef = (ref: HTMLCanvasElement | null) => {
        if (ref) {
            canvasRef.current = ref;
            drawWaveform();
        }
    }

    const onClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const target = e.currentTarget;
        const rect = target.getBoundingClientRect();
        const position = (e.clientX - rect.left) / rect.width;
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
        <div className="overflow-x-auto border rounded-lg max-w-full" ref={setCanvasParRef}>
            <canvas ref={setRef} width={canvasInnerWidth * ratio} height={canvasInnerHeight * ratio}
                    onClick={onClick}
                    style={{width: `${canvasInnerWidth}px`, height: `${canvasInnerHeight}px`}}
                    className="border-solid border-foreground"/>
        </div>
    )
}

export default React.memo(AudioCanvas);
