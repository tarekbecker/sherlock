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

function createBlock(content) {
  return {
    type: 'BlockStatement',
    body: [content]
  };
}

function addStatementInBlock(parent, nodeBefore, added) {
  if (nodeBefore !== null) {
    var i = 0;
    for (; i < parent.body.length; i++) {
      if (parent.body[i] == nodeBefore) {
        break;
      }
    }
    parent.body.splice(i + 1, 0, added);
  } else {
    if (!(parent.body.body instanceof Array)) {
      parent.body = createBlock(parent.body)
    }
    parent.body.body.push(added);
  }
}

var filename = process.argv[2];
console.log('Processing', filename);
var ast = esprima.parse(fs.readFileSync(filename));

estraverse.traverse(ast, {
  enter: function(node) {
    if(node.type === 'ForStatement' || node.type === 'WhileStatement') {
      addStatementInBlock(node, null, createDummyLiteral())
    }
  },
  leave: function(node, parent) {
    if(node.type === 'IfStatement' || node.type === 'WhileStatement') {
      addStatementInBlock(parent, node, createDummyLiteral())
    } else if(node.type === 'ForStatement') {
      addStatementInBlock(parent, node, createDummyLiteral())
    }
  }
});

fs.writeFileSync(process.argv[3], escodegen.generate(ast), 'utf8');