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
                    <div className="flex flex-row gap-x-2">
                        <span>FROM CODE</span>
                        <a
                            href="https://github.com/mahdi-jfri/ooeeaea?tab=readme-ov-file#how-to-write-ooeeaea-code-%EF%B8%8F"
                            className="text-blue-500 hover:text-blue-300"
                        >
                            TUTORIAL📚
                        </a>
                    </div>
                    <CodeAudioPlayer />
                </div>
            </main>
        </>
    );
}
