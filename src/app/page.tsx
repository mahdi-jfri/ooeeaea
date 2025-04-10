"use client";

import CatAudioPlayer from "@/components/CatAudioPlayer";
import MineAudioPlayer from "@/components/MineAudioPlayer";
import CodeAudioPlayer from "@/components/CodeAudioPlayer/CodeAudioPlayer";

export default function Home() {

    return (
        <>
            <main
                className="flex flex-col mx-auto p-5 gap-y-8 items-start sm:items-center font-[family-name:var(--font-geist-sans)]">
                <div className="max-w-full">
                    <div>CAT</div>
                    <CatAudioPlayer />
                </div>
                <div className="max-w-full">
                    <div>MINE</div>
                    <MineAudioPlayer />
                </div>
                <div className="max-w-full">
                    <div>FROM CODE</div>
                    <CodeAudioPlayer />
                </div>
            </main>
        </>
    );
}
