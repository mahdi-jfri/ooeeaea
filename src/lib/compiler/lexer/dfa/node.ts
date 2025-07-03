import {Character, Edge} from "./edge";
import {ALL_USED_CHARACTERS} from "./edge";
import {Lexer, Token} from "../lexer";
import {LexicalError} from "@/lib/compiler/parser/error_writer";

export class DFANode {
    public static nodes: Record<string, DFANode> = {};

    public id: string;
    public isEndNode: boolean;
    private _edges: Map<Character, Edge>;
    public hasLookahead?: boolean;

    constructor(
        identifier: string,
        isEndNode: boolean = false,
        hasLookahead?: boolean
    ) {
        if (hasLookahead !== undefined && !isEndNode) {
            throw new Error("hasLookahead can only be set on end nodes");
        }

        this.id = identifier;
        this.isEndNode = isEndNode;
        this._edges = new Map();
        this.hasLookahead = hasLookahead;

        DFANode.nodes[identifier] = this;
    }

    public get edges(): Map<Character, Edge> {
        return this._edges;
    }

    public set edges(edges: Edge[]) {
        this._edges = edges.reduce((map, edge) => {
            map.set(edge.character, edge);
            return map;
        }, new Map<Character, Edge>());
    }

    public move(character: Character): DFANode {
        const key = character;
        if (this._edges.has(key)) {
            return (this._edges.get(key) as Edge).destination;
        }
        return new InvalidNode(ALL_USED_CHARACTERS.includes(character));
    }

    public getLexemeFromLexer(lexer: Lexer): string {
        const removeCount = this.hasLookahead === true ? 1 : 0;
        return lexer.getLexeme(removeCount);
    }

    public getReturnValue(_lexer: Lexer): Token | LexicalError {
        throw new Error("Not implemented");
    }
}

export class InvalidNode extends DFANode {
    constructor(hasLookahead: boolean = false) {
        super("InvalidNode", true, hasLookahead);
    }

    public move(_: Character): DFANode {
        return this;
    }

    public getReturnValue(lexer: Lexer): LexicalError {
        const lexeme = this.getLexemeFromLexer(lexer);
        return new LexicalError(lexer.lexemeStartLine + 1, lexeme, "Invalid input");
    }
}