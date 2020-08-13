export const Symbols = {
  ARGUMENTS: Symbol('arguments'),
};

export default function astToBody(ast) {
  const fieldNodes = ast.fieldNodes;

  const body = extractSelectionSet(ast.fieldNodes[0].selectionSet);

  return body;
}

function extractArguments(args) {
  if (!Array.isArray(args) || args.length === 0) {
    return {};
  }

  return args.reduce((acc, field) => {
    acc[field.name.value] =
      field.value.kind === 'ObjectValue'
        ? extractArguments(field.value.fields)
        : field.value.value;

    return acc;
  }, {});
}

function extractSelectionSet(set) {
  let body = {};
  set.selections.forEach((el) => {
    if (!el.selectionSet) {
      body[el.name.value] = 1;
    } else {
      body[el.name.value] = extractSelectionSet(el.selectionSet);
      body[el.name.value][Symbols.ARGUMENTS] = extractArguments(el.arguments);
    }
  });

  return body;
}
