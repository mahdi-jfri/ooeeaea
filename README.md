# ooeeaea <img src="https://raw.githubusercontent.com/mahdi-jfri/ooeeaea/refs/heads/main/src/app/favicon.ico" alt="ooeeaea Cat" width="20"/>

This project is a web-based application built with Next.js and TypeScript that allows users to generate "ooeeaea" sounds from a custom programming language, enabling the creation of more complex and automated sound patterns.

## Code Structure

The project's source code is located in the `src` directory and is organized as follows:

* **`src/app`**: Contains the main page and root layout of the application.
* **`src/components`**: Holds all the React components, including various audio players and the UI for the code editor.
* **`src/lib`**:
    * **`compiler`**: The core of the custom language, broken down into:
        * `lexer`: Responsible for breaking the code into a sequence of tokens.
        * `parser`: Analyzes the token sequence to build a syntax tree based on the language's grammar.
        * `icg`: The Intermediate Code Generator, which executes semantic actions as the code is parsed.
    * `tone.ts`: A set of utilities for audio manipulation using the `tone.js` library.

## How to Write "ooeeaea" Code ✍️

The application includes a simple language designed to manipulate strings, which are then converted into sound.

### Language Basics

* **Statements**: Similar to C++, each statement must end with a semicolon (`;`).
* **Comments**: Single-line comments are supported using `//`. Anything after `//` on the same line will be ignored.
* **Final Expression**: The audio is generated from the last expression in the script. This expression must evaluate to a string. It does not need to be terminated by a semicolon.

### Data Types & Expressions

* **Strings**: Strings are created by wrapping the allowed sound characters (`o`, `e`, `a`, `O`, `E`, and space) in double quotation marks (`"`). You can concatenate strings using the `+` operator.
    * *Example*: `"oea o"`, `"o" + "ea"`
* **Numbers**: The language supports positive integers. You can perform addition and multiplication.
    * *Example*: `1 + 2`
* **String Repetition**: You can repeat a string by multiplying it with a number.
    * *Example*: `3 * "a"` results in `"aaa"`.
* **Operator Precedence**: The order of operations is standard:
    1.  Parentheses `( )`
    2.  Multiplication `*`
    3.  Addition `+`
    * *Example*: `(5 + 10) * "a"` results in `"a"` repeated 15 times.

### Variables

You can declare and assign variables to store numbers or strings.

* **Assignment**: Use the format `<variable_name> = <expression>;`
    * *Example*: `my_tone = "o" + "e";`

### Complete Example

This code will generate a sound corresponding to the string `"aeo aeo aeo OOO"`.

```
// Define how many times to repeat the base tone
repeat = 2;

// Create the base tone
tone = "aeo";

// The final expression generates the audio.
// It repeats "aeo " three times, then adds "OOO" at the end.
(repeat + 1) * (tone + " ") + "O" * 3
```
