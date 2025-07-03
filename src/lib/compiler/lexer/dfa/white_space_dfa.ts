import {DFANode} from "./node";
import {Edge, whiteSpaces} from "./edge";
import {Lexer, Token, TokenType} from "../lexer";

export class WhiteSpaceFinalNode extends DFANode {
    constructor() {
        super("WhiteSpaceFinalNode", true, false);
    }

    public getReturnValue(lexer: Lexer): Token {
        const lexeme = this.getLexemeFromLexer(lexer);
        return new Token(TokenType.WHITE_SPACE, lexeme);
    }
}

export function whiteSpaceDFA(): Edge[] {
    const finalNode = new WhiteSpaceFinalNode();
    return whiteSpaces(finalNode);
}
