import { Parser } from "./parser";

export class CompilationError {
    constructor(public lineNumber: number, public message: string) {
    }
    toString(): string {
        return `#${this.lineNumber}: ${this.message}`;
    }
}

export class LexicalError extends CompilationError {
    constructor(public lineNumber: number, public lexeme: string, public message: string) {
        super(lineNumber, `${message}: ${lexeme}`);
    }
}

export class SemanticError extends CompilationError {
}

export class LogicalError extends CompilationError {
}

export class ErrorWriter {
    public errors: CompilationError[] = [];

    constructor(
        private parser: Parser
    ) {}

    public getLine() {
        return this.parser.lexer.lexemeStartLine;
    }

    public writeIllegal(): void {
        const la = this.parser.lookahead;
        this.errors.push(new SemanticError(this.getLine(), `Illegal ${la}`));
    }

    public writeMissing(missingText: string): void {
        this.errors.push(new SemanticError(this.getLine(), `Missing ${missingText}`));
    }

    public writeEOF(): void {
        this.errors.push(new SemanticError(this.getLine(), `Unexpected EOF`));
    }

    public writeLexicalError(lexicalError: LexicalError): void {
        this.errors.push(lexicalError);
    }

    public writeLogicalError(message: string) {
        this.errors.push(new LogicalError(this.getLine(), message));
    }
}
