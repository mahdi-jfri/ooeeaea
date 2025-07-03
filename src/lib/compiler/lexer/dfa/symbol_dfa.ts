import {DFANode} from "./node";
import { Edge, generateEdges } from "./edge";
import {Lexer, Token, TokenType} from "../lexer";

export class SymbolFinalNode extends DFANode {
    constructor() {
        super("symbol", true, false);
    }

    public getReturnValue(lexer: Lexer): Token {
        const lexeme = this.getLexemeFromLexer(lexer);
        return new Token(TokenType.SYMBOL, lexeme);
    }
}

export function symbolDFA(): Edge[] {
    const symbolNode = new SymbolFinalNode();

    return generateEdges(symbolNode, ["*", "+", "=", ";", "(", ")"]);
}
