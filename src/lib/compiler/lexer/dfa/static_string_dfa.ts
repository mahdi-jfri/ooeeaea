import { DFANode } from "./node";
import { Edge, generateEdges, ALL_USED_CHARACTERS } from "./edge";
import { Token, TokenType, Lexer } from "../lexer";
import {LexicalError} from "@/lib/compiler/parser/error_writer";

export class StaticStringNode extends DFANode {
    constructor() {
        super("StaticStringNode", true, false);
    }

    public getReturnValue(lexer: Lexer): Token {
        const lexeme = this.getLexemeFromLexer(lexer);
        return new Token(TokenType.STATIC_STRING, lexeme);
    }
}

export class InvalidStringNode extends DFANode {
    constructor() {
        super("InvalidStringNode", true, false);
    }

    public getReturnValue(lexer: Lexer): LexicalError {
        const lexeme = this.getLexemeFromLexer(lexer);
        return new LexicalError(lexer.lexemeStartLine + 1, lexeme, "Invalid static string");
    }
}

export function staticStringDFA(): Edge[] {
    const allowed = ["a", "e", "o", "A", "E", "O", " "];

    const inString = new DFANode("static_in");
    const finalNode = new StaticStringNode();
    const invalidNode = new InvalidStringNode();

    inString.edges = [
        ...generateEdges(inString, allowed),
        ...generateEdges(finalNode, ['"']),
        ...generateEdges(invalidNode, ALL_USED_CHARACTERS, ['"', ...allowed])
    ];

    finalNode.edges = generateEdges(invalidNode, ALL_USED_CHARACTERS);

    return generateEdges(inString, ['"']);
}
