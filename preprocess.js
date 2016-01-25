var fs = require('fs');
var esprima = require('esprima');
var estraverse = require('estraverse');
var escodegen = require('escodegen');

function createDummyLiteral() {
  return {
    'type': 'ExpressionStatement',
    'expression': {
      'type': 'Literal',
      'value': 'da0b52b0ab43721cda3399320ca940a5a0e571ee',
      'raw': '\'da0b52b0ab43721cda3399320ca940a5a0e571ee\''
    }
  }
}

function countLogicalExpressions(node) {
  if(node.type === 'LogicalExpression') {
    return 1 + countLogicalExpressions(node.left) + countLogicalExpressions(node.right)
  } else {
    return 0;
  }
}

function createBlock(content) {
  return {
    type: 'BlockStatement',
    body: [content]
  };
}

function addStatementInBlock(parent, nodeBefore, added, cnt) {
  var i;
  if (nodeBefore !== null) {
    for (i = 0; i < parent.body.length; i++) {
      if (parent.body[i] == nodeBefore) {
        break;
      }
    }
    for (; cnt > 0; cnt--) {
      parent.body.splice(i + 1, 0, added);
    }
  } else {
    if (!(parent.body.body instanceof Array)) {
      parent.body = createBlock(parent.body)
    }
    for (; cnt > 0; cnt--) {
      parent.body.body.push(added);
    }
  }
}

var filename = process.argv[2];
console.log('Processing', filename);
var ast = esprima.parse(fs.readFileSync(filename));

estraverse.traverse(ast, {
  enter: function(node) {
    if(node.type === 'ForStatement' || node.type === 'WhileStatement') {
      addStatementInBlock(node, null, createDummyLiteral(), countLogicalExpressions(node.test) + 1)
    }
  },
  leave: function(node, parent) {
    if(node.type === 'IfStatement' || node.type === 'WhileStatement') {
      addStatementInBlock(parent, node, createDummyLiteral(), countLogicalExpressions(node.test) + 1)
    } else if(node.type === 'ForStatement') {
      addStatementInBlock(parent, node, createDummyLiteral(), countLogicalExpressions(node.test) + 1)
    }
  }
});

fs.writeFileSync(process.argv[3], escodegen.generate(ast), 'utf8');