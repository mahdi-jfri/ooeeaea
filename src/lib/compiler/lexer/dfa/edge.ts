import {DFANode} from "./node";

export class EOF {}
export type Character = string | typeof EOF;

export const ALL_CHARACTERS: Character[] = [
    ...Array.from({ length: 127 }, (_, i) => String.fromCharCode(i)),
    EOF,
];

export const DIGIT_CHARACTERS: string[] = Array.from("0123456789");
export const LETTER_CHARACTERS: string[] = Array.from("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ");
export const SYMBOLS: string[] = [
    ";",
    "(",
    ")",
    "+",
    "-",
    "*",
    "=",
];
export const WHITE_SPACES: string[] = [" ", "\t", "\n", "\r", "\v", "\f"];

export const ALL_USED_CHARACTERS: Character[] = [
    ...DIGIT_CHARACTERS,
    ...WHITE_SPACES,
    ...LETTER_CHARACTERS,
    ...SYMBOLS,
    "/",
    EOF,
];

export class Edge {
    constructor(public destination: DFANode, public character: Character) {}
}

export function generateEdges(
    destination: DFANode,
    charactersToInclude: Character[],
    charactersToExclude: Character[] = []
): Edge[] {
    return charactersToInclude
        .filter((ch) => !charactersToExclude.includes(ch))
        .map((ch) => new Edge(destination, ch));
}

export function digits(destination: DFANode): Edge[] {
    return generateEdges(destination, DIGIT_CHARACTERS);
}

export function symbols(destination: DFANode): Edge[] {
    return generateEdges(destination, SYMBOLS);
}

export function letters(destination: DFANode): Edge[] {
    return generateEdges(destination, LETTER_CHARACTERS);
}

export function whiteSpaces(destination: DFANode): Edge[] {
    return generateEdges(destination, WHITE_SPACES);
}
