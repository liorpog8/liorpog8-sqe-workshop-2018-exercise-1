import * as esprima from 'esprima';
import * as escodegen  from 'escodegen';
import {Model} from './Model';

let types = {
    'VariableDeclarator': 'variable declarator' ,
    'ReturnStatement': 'return statement' ,
    'AssignmentExpression': 'assignment expression' ,
    'UpdateExpression': 'update expression',
    'FunctionDeclaration': 'function declaration' ,
    'VariableDeclaration': 'variable declaration' ,
    'IfStatement': 'if statement' ,
    'WhileStatement': 'while statement',
    'ForStatement': 'for statement',
};

let funcs = {
    'Literal': (lines_list, parsedJson) => {return parsedJson.value;},
    'Identifier': (lines_list, parsedJson) => {return parsedJson.name;},
    'BinaryExpression': (lines_list, parsedJson) => {return escodegen.generate(parsedJson);},
    'UnaryExpression': (lines_list, parsedJson) => {return escodegen.generate(parsedJson);},
    'VariableDeclarator': (lines_list, parsedJson) => {parse_VariableDeclarator(lines_list, parsedJson);},
    'ReturnStatement': (lines_list, parsedJson) => {parse_ReturnStatement(lines_list, parsedJson); },
    'MemberExpression': (lines_list, parsedJson) => {return escodegen.generate(parsedJson);},
    'ExpressionStatement': (lines_list, parsedJson) => {return parseBytype(lines_list, parsedJson.expression);},
    'AssignmentExpression': (lines_list, parsedJson) => {parse_AssignmentExpression(lines_list, parsedJson);},
    'UpdateExpression': (lines_list, parsedJson) => {return escodegen.generate(parsedJson);},
    'FunctionDeclaration': (lines_list, parsedJson) => {parse_FunctionDeclaration(lines_list, parsedJson);},
    'VariableDeclaration': (lines_list, parsedJson) => {for (let i = 0; i < parsedJson.declarations.length; i++) parseBytype(lines_list, parsedJson.declarations[i]);},
    'BlockStatement': (lines_list, parsedJson) => {for (let i = 0; i < parsedJson.body.length; i++) parseBytype(lines_list, parsedJson.body[i]); },
    'IfStatement': (lines_list, parsedJson) => {parse_IfStatement(lines_list, parsedJson);},
    'WhileStatement': (lines_list, parsedJson) => {parse_WhileStatement(lines_list, parsedJson);},
    'ForStatement': (lines_list, parsedJson) => {parse_ForStatement(lines_list, parsedJson);},
    'Program': (lines_list, parsedJson) => {for (let i = 0; i < parsedJson.body.length; i++) parseBytype(lines_list, parsedJson.body[i]);}
};

const parseCode = (codeToParse) => {
    return esprima.parseScript(codeToParse, {loc:true});
};


const parseToTable = (parsedCode) => {
    let lines_list = [];
    let parsedJson = JSON.parse(parsedCode);
    parseBytype(lines_list, parsedJson);
    return lines_list;
};

const parseBytype = (lines_list, parsedJson) => {
    if (parsedJson == null) return null;
    return funcs[parsedJson.type](lines_list, parsedJson);
};


const parse_VariableDeclarator = (lines_list, parsedJson) => {
    let model = new Model(parsedJson.loc.start.line,
        types[parsedJson.type],
        parseBytype(lines_list, parsedJson.id), '',
        parseBytype(lines_list, parsedJson.init) );
    lines_list.push(model);
};

const parse_ReturnStatement = (lines_list, parsedJson) => {
    let model = new Model(parsedJson.loc.start.line,
        types[parsedJson.type],
        '','',
        parseBytype(lines_list, parsedJson.argument) );
    lines_list.push(model);
};

const parse_AssignmentExpression = (lines_list, parsedJson) => {
    let model = new Model(parsedJson.loc.start.line,
        types[parsedJson.type],
        parseBytype(lines_list, parsedJson.left), '',
        parseBytype(lines_list, parsedJson.right) );
    lines_list.push(model);
};

const parse_FunctionDeclaration = (lines_list, parsedJson) => {
    let model = new Model(parsedJson.loc.start.line,
        types[parsedJson.type],
        parseBytype(lines_list, parsedJson.id) ,'','');
    lines_list.push(model);
    for (let i = 0; i < parsedJson.params.length; i++) {
        model = new Model(parsedJson.params[i].loc.start.line,
            'variable declaration',
            parseBytype(lines_list, parsedJson.params[i]), '', '');
        lines_list.push(model);
    }
    parseBytype(lines_list, parsedJson.body);
};

const parse_IfStatement = (lines_list, parsedJson, elseType) => {
    let operator = parsedJson.test.operator;
    let left = parseBytype(lines_list, parsedJson.test.left);
    let right = parseBytype(lines_list, parsedJson.test.right);
    let condition = left + ' ' + operator + ' ' + right;
    let type = types[parsedJson.type];
    let alternate = parsedJson.alternate;
    if (elseType)
        type = elseType;
    let model = new Model(parsedJson.loc.start.line, type, '', condition, '');
    lines_list.push(model);
    parseBytype(lines_list, parsedJson.consequent);
    if(alternate && (alternate.type === parsedJson.type))
        parse_IfStatement(lines_list, alternate, 'else if statement');
    else
        parseBytype(lines_list, alternate);
};

const parse_WhileStatement = (lines_list, parsedJson) => {
    let operator = parsedJson.test.operator;
    let left = parseBytype(lines_list, parsedJson.test.left);
    let right = parseBytype(lines_list, parsedJson.test.right);
    let condition = left + ' ' + operator + ' ' + right;
    let model = new Model(parsedJson.loc.start.line, types[parsedJson.type], '', condition, '');
    lines_list.push(model);
    parseBytype(lines_list, parsedJson.body);
};

const parse_ForStatement = (lines_list, parsedJson) => {
    let condition = parseBytype(lines_list, parsedJson.test);
    let model = new Model(parsedJson.loc.start.line, types[parsedJson.type], '', condition, '');
    lines_list.push(model);
    parseBytype(lines_list, parsedJson.init);
    parseBytype(lines_list, parsedJson.update);
    parseBytype(lines_list, parsedJson.body);
};

export {parseCode, parseToTable};
