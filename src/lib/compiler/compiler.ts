import {Lexer} from "@/lib/compiler/lexer/lexer";
import {Parser} from "@/lib/compiler/parser/parser";
import {CompilationError} from "@/lib/compiler/parser/error_writer";
import {grammar} from "@/lib/compiler/parser/grammar";

interface CompileResult {
    finalResult: string,
    compilationErrors: CompilationError[],
}

export function compileCode(code: string): CompileResult {
    const lexer = new Lexer(code);
    const parser = new Parser(lexer);
    parser.createDiagram(grammar.split("\n"))
    parser.parse();
    return {finalResult: parser.icg.finalPrintedValue!, compilationErrors: parser.errorWriter.errors};
}
