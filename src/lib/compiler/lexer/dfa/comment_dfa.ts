import { DFANode } from "./node";
import { Edge, generateEdges, ALL_CHARACTERS, EOF } from "./edge";
import { Lexer, Token, TokenType } from "../lexer";

export class CommentFinalNode extends DFANode {
    constructor() {
        super("CommentFinalNode", true, false);
    }

    public getReturnValue(lexer: Lexer): Token {
        const lexeme = this.getLexemeFromLexer(lexer);
        return new Token(TokenType.COMMENT, lexeme);
    }
}

export function commentDFA(): Edge[] {
    const slashNode = new DFANode("comment_start");
    const contentNode = new DFANode("comment_content");
    const finalNode = new CommentFinalNode();

    slashNode.edges = generateEdges(contentNode, ["/"]);

    contentNode.edges = [
        ...generateEdges(contentNode, ALL_CHARACTERS, ["\n", EOF]),
        ...generateEdges(finalNode, ["\n", EOF])
    ];

    return generateEdges(slashNode, ["/"]);
}
