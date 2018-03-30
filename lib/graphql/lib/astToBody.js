export const Symbols = {
  ARGUMENTS: Symbol('arguments'),
};

export default function astToBody(ast) {
  const fieldNodes = ast.fieldNodes;

  const body = extractSelectionSet(ast.fieldNodes[0].selectionSet);

  return body;
}

function extractSelectionSet(set) {
  let body = {};
  set.selections.forEach(el => {
    if (!el.selectionSet) {
      body[el.name.value] = 1;
    } else {
      body[el.name.value] = extractSelectionSet(el.selectionSet);
      if (el.arguments.length) {
        let argumentMap = {};
        el.arguments.forEach(arg => {
          argumentMap[arg.name.value] = arg.value.value;
        });

        body[el.name.value][Symbols.ARGUMENTS] = argumentMap;
      }
    }
  });

  return body;
}
