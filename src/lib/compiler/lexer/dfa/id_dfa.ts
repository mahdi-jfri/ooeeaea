import {DFANode} from "./node";
import {ALL_USED_CHARACTERS, DIGIT_CHARACTERS, digits, Edge, generateEdges, LETTER_CHARACTERS, letters} from "./edge";
import {Lexer, Token, TokenType} from "../lexer";

export class FinalIdNode extends DFANode {
    constructor() {
        super("FinalIdNode", true, true);
    }

    public getReturnValue(lexer: Lexer): Token {
        const lexeme = this.getLexemeFromLexer(lexer);
        return new Token(TokenType.ID, lexeme);
    }
}

export function idDFA(): Edge[] {
    const startNode = new DFANode("idStart");
    const finalNode = new FinalIdNode();

    startNode.edges = [
        ...letters(startNode)
    ];

    startNode.edges = [
        ...letters(startNode),
        ...digits(startNode),
        ...generateEdges(finalNode, ALL_USED_CHARACTERS, [...DIGIT_CHARACTERS, ...LETTER_CHARACTERS])
    ];

    return letters(startNode);
}
