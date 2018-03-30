import { check, Match } from 'meteor/check';
import astToBody, { Symbols } from './astToBody';
import defaults from './defaults';
import intersectDeep from '../../query/lib/intersectDeep';
import enforceMaxLimit from '../../exposure/lib/enforceMaxLimit';

const Errors = {
  MAX_DEPTH: 'The maximum depth of this request exceeds the depth allowed.',
};

export default function astToQuery(ast, config = {}) {
  const collection = this;

  check(config, {
    embody: Match.Maybe(Function),
    $filters: Match.Maybe(Object),
    $options: Match.Maybe(Object),
    maxDepth: Match.Maybe(Number),
    maxLimit: Match.Maybe(Number),
    deny: Match.Maybe([String]),
    intersect: Match.Maybe(Object),
  });

  config = Object.assign(
    {
      $options: {},
      $filters: {},
    },
    defaults,
    config
  );

  // get the body
  let body = astToBody(ast);

  // first we do the intersection
  if (config.intersect) {
    body = intersectDeep(config.intersect, body);
  }

  // enforce the maximum amount of data we allow to retrieve
  if (config.maxLimit) {
    enforceMaxLimit(config.$options, config.maxLimit);
  }

  // figure out depth based
  if (config.maxDepth) {
    const currentMaxDepth = getMaxDepth(body);
    if (currentMaxDepth > config.maxDepth) {
      throw Errors.MAX_DEPTH;
    }
  }

  if (config.deny) {
    deny(body, config.deny);
  }

  Object.assign(body, {
    $filters: config.$filters,
    $options: config.$options,
  });

  if (config.embody) {
    const getArgs = createGetArgs(body);
    config.embody.call(null, {
      body,
      getArgs,
    });
  }

  // we return the query
  return this.createQuery(body);
}

export function getMaxDepth(body) {
  let depths = [];
  for (key in body) {
    if (_.isObject(body[key])) {
      depths.push(getMaxDepth(body[key]));
    }
  }

  if (depths.length === 0) {
    return 1;
  }

  return Math.max(...depths) + 1;
}

export function deny(body, fields) {
  fields.forEach(field => {
    let parts = field.split('.');
    let accessor = body;
    while (parts.length != 0) {
      if (parts.length === 1) {
        delete accessor[parts[0]];
      } else {
        if (!_.isObject(accessor)) {
          break;
        }
        accessor = accessor[parts[0]];
      }
      parts.shift();
    }
  });

  return clearEmptyObjects(body);
}

export function clearEmptyObjects(body) {
  // clear empty nodes then back-propagate
  for (let key in body) {
    if (_.isObject(body[key])) {
      const shouldDelete = clearEmptyObjects(body[key]);
      if (shouldDelete) {
        delete body[key];
      }
    }
  }

  return Object.keys(body).length === 0;
}

export function createGetArgs(body) {
  return function(path) {
    const parts = path.split('.');
    let stopped = false;
    let accessor = body;
    for (var i = 0; i < parts.length; i++) {
      if (!accessor) {
        stopped = true;
        break;
      }

      if (accessor[parts[i]]) {
        accessor = accessor[parts[i]];
      }
    }

    if (stopped) {
      return {};
    }

    if (accessor) {
      return accessor[Symbols.ARGUMENTS] || {};
    }
  };
}
