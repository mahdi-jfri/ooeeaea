import {DFANode} from "./node";
import { Edge, generateEdges, digits, letters, ALL_USED_CHARACTERS, DIGIT_CHARACTERS, LETTER_CHARACTERS } from "./edge";
import {Lexer, Token, TokenType} from "../lexer";
import {LexicalError} from "@/lib/compiler/parser/error_writer";

export class FinalNUMNode extends DFANode {
    constructor() {
        super("FinalNUMNode", true, true);
    }

    public getReturnValue(lexer: Lexer): Token {
        const lexeme = this.getLexemeFromLexer(lexer);
        return new Token(TokenType.NUMBER, lexeme);
    }
}

export class InvalidNumberNode extends DFANode {
    constructor() {
        super("InvalidNumberNode", true, false);
    }

    public getReturnValue(lexer: Lexer): LexicalError {
        const lexeme = this.getLexemeFromLexer(lexer);
        return new LexicalError(lexer.lexemeStartLine + 1, lexeme, `Invalid number`);
    }
}

export function numDFA(): Edge[] {
    const node1 = new DFANode("num_start");
    const node2 = new FinalNUMNode();
    const invalidNode = new InvalidNumberNode();

    node1.edges = [
        ...digits(node1),
        ...letters(invalidNode),
        ...generateEdges(node2, ALL_USED_CHARACTERS, [...DIGIT_CHARACTERS, ...LETTER_CHARACTERS]),
    ];

    return digits(node1);
}
