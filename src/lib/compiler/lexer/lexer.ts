import {commentDFA} from "./dfa/comment_dfa";
import {numDFA} from "./dfa/num_dfa";
import {symbolDFA} from "./dfa/symbol_dfa";
import {whiteSpaceDFA} from "./dfa/white_space_dfa";
import {DFANode} from "./dfa/node";
import {EOF} from "./dfa/edge";
import {idDFA} from "./dfa/id_dfa";
import {staticStringDFA} from "@/lib/compiler/lexer/dfa/static_string_dfa";
import {LexicalError} from "@/lib/compiler/parser/error_writer";

export enum TokenType {
    NUMBER = "NUMBER",
    ID = "ID",
    SYMBOL = "SYMBOL",
    COMMENT = "COMMENT",
    WHITE_SPACE = "WHITE_SPACE",
    STATIC_STRING = "STATIC_STRING",
}

export class Token {
    constructor(public type: TokenType, public tokenString?: string) {
    };
}

function buildDFA(): DFANode {
    const initial = new DFANode("0");
    initial.edges = [
        ...numDFA(),
        ...staticStringDFA(),
        ...idDFA(),
        ...symbolDFA(),
        ...commentDFA(),
        ...whiteSpaceDFA(),
    ];
    return initial;
}

export class DoneScanning extends Error {
}

class TextStream {
    private position: number;

    constructor(private text: string) {
        this.position = 0;
    }

    readChar(): string {
        if (this.position >= this.text.length)
            return "";
        this.position++;
        return this.text[this.position - 1];
    }
}

export class Lexer {
    private stream: TextStream;
    private root: DFANode;
    private currentNode: DFANode;
    private soFarLexeme: string;
    private lastChar: string;
    private shouldGoBack: boolean;
    private currentLine: number;
    public lexemeStartLine: number;

    public tokens: Token[] = [];
    public errors: LexicalError[] = [];

    constructor(text: string) {
        this.stream = new TextStream(text);
        this.root = buildDFA();
        this.currentNode = this.root;
        this.soFarLexeme = "";
        this.lastChar = "";
        this.shouldGoBack = false;
        this.currentLine = 1;
        this.lexemeStartLine = 0
    }

    public getLexeme(removeEndChars: number = 0): string {
        if (removeEndChars > 0 && this.lastChar === "") {
            removeEndChars -= 1;
        }
        return removeEndChars > 0
            ? this.soFarLexeme.slice(0, -removeEndChars)
            : this.soFarLexeme;
    }

    private moveToNextCharacter(): string {
        if (!this.shouldGoBack) {
            if (this.lastChar === "\n") {
                this.currentLine++;
            }
            this.lastChar = this.stream.readChar();
        }
        this.shouldGoBack = false;
        this.soFarLexeme += this.lastChar;
        return this.lastChar;
    }

    private goBack(): void {
        this.shouldGoBack = true;
    }

    private handleReturnValue(value: Token | LexicalError): void {
        if (value instanceof LexicalError) {
            if (value.lexeme !== "") {
                this.errors.push(value);
            } else {
                throw new DoneScanning();
            }
        } else {
            this.tokens.push(value);
        }
    }

    private handleEndNode(): Token | LexicalError {
        const result = this.currentNode.getReturnValue(this);
        if (this.currentNode.hasLookahead && this.lastChar !== "") {
            this.goBack();
        }
        return result;
    }

    private setupStep(): void {
        this.soFarLexeme = "";
        this.lexemeStartLine = this.currentLine + (this.lastChar == '\n' ? 1 : 0);
        this.currentNode = this.root;
    }

    private step(): Token | LexicalError | typeof EOF {
        this.setupStep();
        let ch = "";
        while (!this.currentNode.isEndNode) {
            ch = this.moveToNextCharacter();
            const inputChar = ch === "" ? EOF : ch;
            this.currentNode = this.currentNode.move(inputChar);
        }
        if (ch === "") {
            return EOF;
        }
        return this.handleEndNode();
    }

    public getLookahead() {
        return this.step();
    }
}
