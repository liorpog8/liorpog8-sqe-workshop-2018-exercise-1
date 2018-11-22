import assert from 'assert';
import {parseCode, parseToTable} from '../src/js/code-analyzer';
import {Model} from '../src/js/Model';

describe('Model',() => {
    it('get_tr', () => {
        let model = new Model(1,'test','modelTest','x > 1','testValue');
        assert.equal(model.get_tr(),
            '<tr><td align="center">1</td><td align="center">test</td><td align="center">modelTest</td><td align="center">x > 1</td><td align="center">testValue</td></tr>');});
});

describe('Declarations',() => {
    it('VariableDeclarator', () => {
        assert.deepEqual(parseToTable(JSON.stringify(parseCode('let a = 1;'))),
            [new Model(1, 'variable declarator', 'a', '', 1)]);});

    it('FunctionDeclaration', () => {
        assert.deepEqual(parseToTable(JSON.stringify(parseCode('function a(x){}'))),
            [new Model(1, 'function declaration', 'a', '', ''),
                new Model(1, 'variable declaration', 'x', '', '')]);});
});

describe('Statements',() => {
    it('WhileStatement', () => {
        assert.deepEqual(parseToTable(JSON.stringify(parseCode('while(i < 10)\n{x = 5}'))),
            [new Model(1,'while statement','','i < 10',''),
                new Model(2,'assignment expression','x','','5')]);});

    it('ForStatement', () => {
        assert.deepEqual(parseToTable(JSON.stringify(parseCode('for(var i = 0; i < 10; i = i + 1)\n{x = 5;}'))),
            [new Model(1, 'for statement', '', 'i < 10', ''),
                new Model(1, 'variable declarator', 'i', '', 0),
                new Model(1, 'assignment expression', 'i', '', 'i + 1'),
                new Model(2, 'assignment expression', 'x', '', '5')]);});

    it('IfStatement', () => {
        assert.deepEqual(parseToTable(JSON.stringify(parseCode('if(i < 10)\n{x = x + 6}'))),
            [new Model(1,'if statement','','i < 10',''),
                new Model(2,'assignment expression','x','','x + 6')]);});

    it('IfStatement with else', () => {
        assert.deepEqual(parseToTable(JSON.stringify(parseCode('if(i < 10)\n{x = i}\nelse\n{x = i + 1}'))),
            [new Model(1,'if statement','','i < 10',''),
                new Model(2,'assignment expression','x','','i'),
                new Model(4,'assignment expression','x','','i + 1')]);});

    it('IfStatement with elseif', () => {
        assert.deepEqual(parseToTable(JSON.stringify(parseCode('if(x < 10)\n{x = i;}\nelse\nif(x > 10)\n{i = x;}'))),
            [new Model(1,'if statement','','x < 10',''),
                new Model(2,'assignment expression','x','','i'),
                new Model(4,'else if statement','','x > 10',''),
                new Model(5,'assignment expression','i','','x')]);});

    it(':FunctionDeclaration with ReturnStatement', () => {
        assert.deepEqual(parseToTable(JSON.stringify(parseCode('function binarySearch(A){\nx = -2;\nreturn x;}'))),
            [new Model(1, 'function declaration', 'binarySearch', '', ''),
                new Model(1, 'variable declaration', 'A', '', ''),
                new Model(2,'assignment expression','x','','-2'),
                new Model(3, 'return statement', '', '', 'x')]);});
});

describe('Expressions',() => {
    it('MemberExpression', () => {
        assert.deepEqual(parseToTable(JSON.stringify(parseCode('x = arr[x];'))),
            [new Model(1,'assignment expression','x','','arr[x]'),]);});

    it('ForStatement with update', () => {
        assert.deepEqual(parseToTable(JSON.stringify(parseCode('for(var i = 0; i < 10; i = i++){\n for(var j = 0; j < 10; j = ++j){\nx = i + j;}}'))),
            [new Model(1,'for statement','','i < 10',''),
                new Model(1,'variable declarator','i','',0),
                new Model(1,'assignment expression','i','','i++'),
                new Model(2,'for statement','','j < 10',''),
                new Model(2,'variable declarator','j','',0),
                new Model(2,'assignment expression','j','','++j'),
                new Model(3,'assignment expression','x','','i + j')]);});

    it('ExpressionStatement', () => {
        assert.deepEqual(parseToTable(JSON.stringify(parseCode('let low;\n\n\nlow = 0;'))),
            [new Model(1,'variable declarator','low','',null),
                new Model(4,'assignment expression','low','',0)]);});
});