function hasValue(value) {
  return !(typeof (value) === 'undefined' || value === null || value === '');
}

function joinParams(...params) {
  return params.filter((param) => hasValue(param)).join(', ');
}

function findExpect(path, j) {
  return j(path).find(j.CallExpression, {
    callee: {
      name: 'expect'
    }
  });
}

function findNegation(path, j) {
  let notIdentifier = j(path).find(j.Identifier, {
    name: 'not'
  });
  return notIdentifier.length !== 0;
}

function findSelectorHelper(path, j) {
  return ['find', 'findAll'].some((name) => {
    return j(path).find(j.Identifier, { name }).length;
  });
}

function hasChainedProperty(node, j) {
  let property = node.property || node.callee.property;
  return property && property.name;
}

function extractExpect(path, j) {
  let expectPath = findExpect(path, j).at(0).get();
  let hasShouldNot = findNegation(path, j);
  let assertArguments = expectPath.node.arguments;
  let assertArgument = assertArguments[0];
  let assertArgumentSource = j(assertArgument).toSource();
  let hasMessage = (assertArguments.length > 1);

  let hasSelector = findSelectorHelper(assertArguments, j);
  let hasSelectorWithoutProperty = hasSelector && !hasChainedProperty(assertArgument);

  let assertMessage = '';

  if (hasMessage) {
    assertMessage = j(assertArguments[1]).toSource();
  }

  return {
    expectPath,
    assertArgument,
    assertArgumentSource,
    hasMessage,
    assertMessage,
    hasShouldNot,
    hasSelector,
    hasSelectorWithoutProperty
  };
}

function constructDomExists(j, assertArgument, assertMessage, exists = true, length = 1) {
  let countParam = '';
  let domSelector = j(assertArgument.arguments).toSource();
  let domExpression = '';

  if (exists) {
    if (length > 1 || hasValue(assertMessage)) {
      countParam = `{ count: ${length} }`;
    }
    domExpression = `exists(${joinParams(countParam, assertMessage)})`;
  } else {
    domExpression = `doesNotExist(${assertMessage})`;
  }

  return `assert.dom(${domSelector}).${domExpression};`;
}

function renameIdentifier(fromName, toName, root, j) {
  root.find(j.Identifier, {
      name: fromName
  }).forEach(path => path.node.name = toName);
}

function renameImport(fromName, toName, root, j) {
  root.find(j.ImportDeclaration, {
      source: {
        value: fromName
      }
    })
    .forEach(({
      node
    }) => node.source.value = toName);
}

function renameIdentifiers(list, root, j) {
  list.forEach(([fromName, toName]) => {
    renameIdentifier(fromName, toName, root, j);
  });
}

function renameImports(list, root, j) {
  list.forEach(([fromName, toName]) => {
    renameImport(fromName, toName, root, j);
  });
}


module.exports = {
  hasValue,
  joinParams,
  findExpect,
  extractExpect,
  constructDomExists,
  findNegation,
  renameIdentifier,
  renameImport,
  renameIdentifiers,
  renameImports
}
