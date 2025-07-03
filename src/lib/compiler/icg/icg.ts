import {Token} from "@/lib/compiler/lexer/lexer";
import {EOF} from "@/lib/compiler/lexer/dfa/edge";
import {Parser} from "@/lib/compiler/parser/parser";

class Value {

}

class StringValue extends Value {
    constructor(public value: string) {
        super();
    }
}

class NumberValue extends Value {
    constructor(public value: number) {
        super();
    }
}

class IDValue extends Value {
    constructor(public value: string) {
        super();
    }
}

class SemanticStack {
    private stack: Value[] = [];

    public push(input: Value) {
        this.stack.push(input);
    }

    public pop() {
        return this.stack.pop()
    }

    public last() {
        return this.stack.length ? this.stack[this.stack.length - 1] : undefined;
    }

    public first() {
        return this.stack.length ? this.stack[0] : undefined;
    }
}

class ICGSymbolTable {
    private table: Map<string, string | number> = new Map();

    public insertVariable(variableSymbol: string, value: string | number) {
        this.table.set(variableSymbol, value);
    }

    public findSymbol(name: string) {
        return this.table.get(name);
    }
}

type ActionCallback = (input: string) => void;

export class ICG {
    private semanticStack: SemanticStack;
    private symbolTable: ICGSymbolTable;
    private actions: Record<string, ActionCallback>;
    public finalPrintedValue?: string;

    constructor(private parser: Parser) {
        this.semanticStack = new SemanticStack()
        this.symbolTable = new ICGSymbolTable()
        this.actions = {
            'ActionPrintFinalResult': this.actionPrintFinalResult,
            'ActionSaveID': this.actionSaveID,
            'ActionAssign': this.actionAssign,
            'ActionPushNumber': this.actionPushNumber,
            'ActionPushString': this.actionPushString,
            'ActionAdd': this.actionAdd,
            'ActionMultiply': this.actionMultiply,
            'ActionLookupAndPushValue': this.actionLookupAndPushValue,
            'ActionLookupSavedID': this.actionLookupSavedID,
        }
    }

    public performAction(actionName: string, token: Token | typeof EOF) {
        this.actions[actionName]((token instanceof Token ? token.tokenString : "") || "")
    }

    private actionPrintFinalResult = (_input: string) => {
        const value = this.semanticStack.pop();
        if (!(value instanceof StringValue)) {
            this.parser.errorWriter.writeLogicalError(`Final statement should be a string.`);
            return;
        }
        this.finalPrintedValue = value.value;
    }

    private actionSaveID = (input: string) => {
        this.semanticStack.push(new IDValue(input));
    }

    private actionAssign = (_input: string) => {
        const value = this.semanticStack.pop();
        const idValue = this.semanticStack.pop();
        if (!(value instanceof StringValue) && !(value instanceof NumberValue)) {
            this.parser.errorWriter.writeLogicalError(`Assigning invalid value.`);
            return;
        }
        if (!(idValue instanceof IDValue)) {
            this.parser.errorWriter.writeLogicalError(`Assigning to invalid variable.`);
            return;
        }
        this.symbolTable.insertVariable(idValue.value, value.value);
    }

    private actionPushNumber = (input: string) => {
        this.semanticStack.push(new NumberValue(parseInt(input, 10)));
    }

    private actionPushString = (input: string) => {
        this.semanticStack.push(new StringValue(input.slice(1, input.length - 1)));
    }

    private actionAdd = (_input: string) => {
        const op2 = this.semanticStack.pop();
        const op1 = this.semanticStack.pop();
        if (op1 instanceof NumberValue && op2 instanceof NumberValue) {
            this.semanticStack.push(new NumberValue(op1.value + op2.value));
        } else if (op1 instanceof StringValue && op2 instanceof StringValue) {
            this.semanticStack.push(new StringValue(op1.value + op2.value));
        } else
            this.parser.errorWriter.writeLogicalError("Adding unexpected values");
    }

    private actionMultiply = (_input: string) => {
        const op1 = this.semanticStack.pop();
        const op2 = this.semanticStack.pop();
        if (op1 instanceof NumberValue && op2 instanceof NumberValue) {
            this.semanticStack.push(new NumberValue(op1.value * op2.value));
        } else if (op1 instanceof StringValue && op2 instanceof NumberValue) {
            this.semanticStack.push(new StringValue(op1.value.repeat(op2.value)));
        } else if (op1 instanceof NumberValue && op2 instanceof StringValue) {
            this.semanticStack.push(new StringValue(op2.value.repeat(op1.value)));
        } else
            this.parser.errorWriter.writeLogicalError("Multiplying unexpected values");
    }

    private actionLookupAndPushValue = (input: string) => {
        const value = this.symbolTable.findSymbol(input);
        if (typeof value === "undefined") {
            this.parser.errorWriter.writeLogicalError(`Undefined variable ${input}.`);
        } else if (typeof value === "string") {
            this.semanticStack.push(new StringValue(value));
        } else {
            this.semanticStack.push(new NumberValue(value));
        }
    }

    private actionLookupSavedID = (_input: string) => {
        const idValue = this.semanticStack.pop() as IDValue;
        this.actionLookupAndPushValue(idValue.value);
    }
}