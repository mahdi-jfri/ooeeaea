export const grammar = `
Program -> ProgramBody ActionPrintFinalResult $

ProgramBody -> ActionSaveID /ID StartRule
ProgramBody -> Factor_NoID TermPrime ExprPrime /;

StartRule -> /= Expr ActionAssign /; ProgramBody
StartRule -> ActionLookupSavedID TermPrime ExprPrime /;

Factor_NoID -> ActionPushNumber /NUMBER
Factor_NoID -> ActionPushString /STATIC_STRING
Factor_NoID -> /( Expr /)

Expr -> Term ExprPrime

ExprPrime -> /+ Term ActionAdd ExprPrime
ExprPrime -> EPSILON

Term -> Factor TermPrime

TermPrime -> /* Factor ActionMultiply TermPrime
TermPrime -> EPSILON

Factor -> ActionPushString /STATIC_STRING
Factor -> ActionPushNumber /NUMBER
Factor -> ActionLookupAndPushValue /ID
Factor -> /( Expr /)

ActionPrintFinalResult -> EPSILON
ActionSaveID -> EPSILON
ActionAssign -> EPSILON
ActionPushNumber -> EPSILON
ActionPushString -> EPSILON
ActionAdd -> EPSILON
ActionMultiply -> EPSILON
ActionLookupAndPushValue -> EPSILON
ActionLookupSavedID -> EPSILON
`;