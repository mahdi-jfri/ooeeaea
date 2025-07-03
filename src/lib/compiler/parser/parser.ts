import {DoneScanning, Lexer, Token, TokenType} from "../lexer/lexer";
import {EOF} from "../lexer/dfa/edge";
import {ErrorWriter, LexicalError} from "./error_writer";
import {ICG} from "@/lib/compiler/icg/icg";

export const EMPTY_CHAIN = 'EPSILON';
export const END_MARKER = '$';

export class DoneParsing extends Error {
}

export class TreeNode {
    public _parent?: TreeNode = undefined;
    public children: TreeNode[] = [];

    constructor(public name: string) {
    }

    public get parent(): TreeNode | undefined {
        return this._parent;
    }

    public set parent(parent: TreeNode | undefined) {
        if (this._parent)
            this._parent.children = this._parent.children.filter((e: TreeNode) => e !== this);
        this._parent = parent;
        if (parent)
            parent.children.push(this);
    }
}

export class Diagram {
    constructor(
        public predict: Set<string>,
        public firstState: State
    ) {
    }
}

export class NonTerminal {
    public diagrams: Diagram[] = [];

    constructor(
        public first: Set<string>,
        public follow: Set<string>,
        public name: string
    ) {
    }

    private normalizedLookahead(lookahead: string): string {
        if (lookahead === EMPTY_CHAIN || lookahead === END_MARKER) return lookahead;
        return '/' + lookahead;
    }

    public findDiagram(parser: Parser, goDown: boolean = true): void {
        try {
            if (goDown) parser.goDownWithNonTerminal(this);
            for (const d of this.diagrams) {
                if (d.predict.has(this.normalizedLookahead(parser.lookahead))) {
                    d.firstState.procedure(parser);
                    parser.goUp();
                    return;
                }
            }
            if (this.follow.has(this.normalizedLookahead(parser.lookahead))) {
                parser.writeMissingNonTerminal(this);
                parser.deleteCurrentNode();
                return;
            }
            parser.illegalLookahead();
            this.findDiagram(parser, false);
        } catch (e) {
            if (e instanceof DoneScanning) {
                parser.deleteCurrentNode();
                throw e;
            }
            throw e;
        }
    }
}

export class Edge {
    constructor(
        public destination: State,
        public token: string | NonTerminal
    ) {
    }

    get tokenIsTerminal(): boolean {
        return typeof this.token === 'string';
    }
}

export class State {
    public edge?: Edge;

    constructor(public isFinal: boolean) {
    }

    public addEdge(edge: Edge): void {
        this.edge = edge;
    }

    public procedure(parser: Parser): void {
        if (this.isFinal) return;
        const edge = this.edge!;
        if (edge.tokenIsTerminal) {
            const tok = edge.token as string;
            if (tok === EMPTY_CHAIN) {
                parser.goDownWithEpsilon();
                parser.goUp();
                edge.destination.procedure(parser);
            } else if (parser.lookahead === tok) {
                parser.goDownWithLookahead();
                parser.goUp();
                parser.getNextLookahead();
                edge.destination.procedure(parser);
            } else {
                parser.writeMissingTerminal(tok);
                edge.destination.procedure(parser);
            }
        } else {
            (edge.token as NonTerminal).findDiagram(parser);
            edge.destination.procedure(parser);
        }
    }
}

export class ActionState extends State {
    constructor(isFinal: boolean, public actionName: string) {
        super(isFinal);
    }

    public procedure(parser: Parser): void {
        parser.icg.performAction(this.actionName, parser.token as (Token | typeof EOF));
    }
}

export class Parser {
    public nonTerminals: Record<string, NonTerminal> = {};
    public firstSets: Record<string, Set<string>> = {};
    public followSets: Record<string, Set<string>> = {};
    public predictSets: Set<string>[] = [];
    public initNonTerminal!: NonTerminal;
    public currentNode?: TreeNode;
    public errorWriter: ErrorWriter;

    private _token: Token | typeof EOF | undefined;
    icg: ICG;

    constructor(
        public lexer: Lexer,
    ) {
        this.errorWriter = new ErrorWriter(this);
        this.icg = new ICG(this);
    }

    getLookaheadFromLexer(): Token | typeof EOF {
        const lookahead = this.lexer.getLookahead();
        if (lookahead instanceof LexicalError) {
            this.errorWriter.writeLexicalError(lookahead);
            return this.getLookaheadFromLexer();
        }
        return lookahead as Token | typeof EOF;
    }

    getNextLookahead(): string {
        this._token = this.getLookaheadFromLexer();
        return this.lookahead;
    }

    public get token() {
        return this._token;
    }

    public get lookahead(): string {
        if (this._token === undefined)
            return this.getNextLookahead();
        if (this._token == EOF)
            return END_MARKER;
        const actualToken = this._token as Token;
        if (actualToken.type == TokenType.WHITE_SPACE || actualToken.type == TokenType.COMMENT)
            return this.getNextLookahead();
        if (actualToken.type != TokenType.ID && actualToken.type != TokenType.NUMBER && actualToken.type != TokenType.STATIC_STRING)
            return actualToken.tokenString as string;
        return actualToken.type;
    }

    private getRules(grammarStrings: string[]): [string[][], Set<string>] {
        const rules: string[][] = [];
        const nt = new Set<string>();
        for (const line of grammarStrings) {
            if (!line.trim()) continue;
            const [lhs, rhs] = line.split('->').map(s => s.trim());
            nt.add(lhs);
            const alts = rhs.split('|').map(s => s.trim());
            for (const alt of alts) {
                rules.push([lhs, ...alt.split(' ').filter(tok => tok.length > 0)]);
            }
        }
        return [rules, nt];
    }

    private extendGrammar(rule: string[], left: string): State {
        let startState: State;
        if (left.startsWith('Action')) {
            startState = new ActionState(false, left);
        } else {
            startState = new State(false);
        }
        let node: State = startState;
        const right = rule.slice(1);
        for (let i = 0; i < right.length; i++) {
            const tok = right[i];
            const isFinal = i === right.length - 1;
            const nextNode = new State(isFinal);
            let tokenOrNT: string | NonTerminal = tok;
            if (tokenOrNT[0] !== '/' && tokenOrNT !== EMPTY_CHAIN && tokenOrNT !== END_MARKER) {
                tokenOrNT = this.nonTerminals[tokenOrNT];
            } else if (tokenOrNT !== EMPTY_CHAIN && tokenOrNT !== END_MARKER) {
                tokenOrNT = tokenOrNT.slice(1);
            }
            node.addEdge(new Edge(nextNode, tokenOrNT));
            node = nextNode;
        }
        return startState;
    }

    public createDiagram(grammarStrings: string[]): void {
        const [rules, ntSet] = this.getRules(grammarStrings);
        for (const nt of ntSet) {
            this.firstSets[nt] = new Set<string>();
            this.followSets[nt] = new Set<string>();
        }
        this.makeFirstSets(rules);
        this.makeFollowSets(rules);
        for (const nt of ntSet) {
            this.nonTerminals[nt] = new NonTerminal(
                this.firstSets[nt],
                this.followSets[nt],
                nt
            );
        }
        this.initNonTerminal = this.nonTerminals[rules[0][0]];
        this.makePredictSets(rules);
        for (let i = 0; i < rules.length; i++) {
            const left = rules[i][0];
            const start = this.extendGrammar(rules[i], left);
            this.nonTerminals[left].diagrams.push(
                new Diagram(this.predictSets[i], start)
            );
        }
    }

    private collectSet(
        initial: Set<string>,
        items: string[],
        additional: Set<string>
    ): Set<string> {
        const result = new Set(initial);
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item[0] !== '/' && item !== EMPTY_CHAIN && item !== END_MARKER) {
                for (const x of this.firstSets[item].values()) {
                    if (x !== EMPTY_CHAIN) result.add(x);
                }
                if (this.firstSets[item].has(EMPTY_CHAIN)) {
                    if (i + 1 < items.length) continue;
                    for (const x of additional) result.add(x);
                } else {
                    return result;
                }
            } else {
                result.add(item);
                return result;
            }
        }
        return result;
    }

    private makeFirstSets(rules: string[][]): void {
        let changed = true;
        while (changed) {
            changed = false;
            for (const rule of rules) {
                const left = rule[0];
                const right = rule.slice(1);
                const originalSize = this.firstSets[left].size;
                const s = this.collectSet(this.firstSets[left], right, new Set([EMPTY_CHAIN]));
                this.firstSets[left] = new Set([...this.firstSets[left], ...s]);
                if (this.firstSets[left].size !== originalSize) changed = true;
            }
        }
    }

    private makeFollowSets(rules: string[][]): void {
        this.followSets[rules[0][0]].add(END_MARKER);
        let changed = true;
        while (changed) {
            changed = false;
            for (const rule of rules) {
                const left = rule[0];
                const right = rule.slice(1);
                for (let i = 0; i < right.length; i++) {
                    const item = right[i];
                    let s = this.followSets[item];
                    if (s === undefined)
                        this.followSets[item] = s = new Set();
                    if (i + 1 < right.length)
                        s = s.union(this.collectSet(s, right.slice(i + 1), this.followSets[left]));
                    else
                        s = s.union(this.followSets[left]);
                    if (this.followSets[item].size != s.size) {
                        this.followSets[item] = s;
                        changed = true;
                    }
                }
            }
        }
    }

    private makePredictSets(rules: string[][]): void {
        for (const rule of rules) {
            const left = rule[0];
            const right = rule.slice(1);
            const firstItem = right[0];
            let s = new Set<string>();
            if (firstItem !== EMPTY_CHAIN) {
                if (firstItem[0] !== '/') {
                    s = this.collectSet(new Set(), right, this.followSets[left]);
                } else {
                    s.add(firstItem);
                }
            } else {
                s = new Set(this.followSets[left]);
            }
            this.predictSets.push(s);
        }
    }

    public goUp(): void {
        this.currentNode = (this.currentNode as TreeNode).parent!;
    }

    public goDownWithNonTerminal(nt: NonTerminal): void {
        this.goDown(new TreeNode(nt.name));
    }

    public goDownWithLookahead(): void {
        const text = this._token === EOF ? END_MARKER : `(${(this._token as Token).type}, ${(this._token as Token).tokenString})`;
        this.goDown(new TreeNode(text));
    }

    public goDownWithEpsilon(): void {
        this.goDown(new TreeNode(EMPTY_CHAIN.toLowerCase()));
    }

    private goDown(node: TreeNode): void {
        node.parent = this.currentNode as TreeNode;
        this.currentNode = node;
    }

    public illegalLookahead(): void {
        if (this._token === EOF) {
            this.errorWriter.writeEOF();
            throw new DoneParsing();
        } else {
            this.errorWriter.writeIllegal();
            this.getNextLookahead();
        }
    }

    public writeMissingNonTerminal(nonTerminal: NonTerminal): void {
        this.errorWriter.writeMissing(nonTerminal.name);
    }

    public writeMissingTerminal(terminal: string): void {
        this.errorWriter.writeMissing(terminal);
    }

    public deleteCurrentNode(): void {
        const node = this.currentNode as TreeNode;
        this.goUp();
        node.parent = undefined;
    }

    public parse(): void {
        const root = new TreeNode('root');
        this.currentNode = root;
        try {
            this.initNonTerminal.findDiagram(this);
        } catch (e) {
            if (!(e instanceof DoneParsing))
                throw e;
        }
    }
}
