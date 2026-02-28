import { check, Match } from 'meteor/check';
import deepClone from 'lodash.clonedeep';
import { specialFields } from './createGraph';

function defaultFilterFunction({ filters, options, params }) {
  if (params.filters) {
    Object.assign(filters, params.filters);
  }
  if (params.options) {
    Object.assign(options, params.options);
  }
}

async function applyFilterRecursive(data, params = {}, isRoot = false) {
  if (isRoot && !_.isFunction(data.$filter)) {
    data.$filter = defaultFilterFunction;
  }

  if (data.$filter) {
    check(data.$filter, Match.OneOf(Function, [Function]));

    data.$filters = data.$filters || {};
    data.$options = data.$options || {};

    if (Array.isArray(data.$filter)) {
      for (const filter of data.$filter) {
        await filter.call(null, {
          filters: data.$filters,
          options: data.$options,
          params: params,
        });
      }
    } else {
      await data.$filter({
        filters: data.$filters,
        options: data.$options,
        params: params,
      });
    }

    data.$filter = null;
    delete data.$filter;
  }

  for (const [key, value] of Object.entries(data)) {
    // Skip special fields
    if (specialFields.includes(key)) {
      continue;
    }
    if (value && typeof value === 'object') {
      await applyFilterRecursive(value, params);
    }
  }
}

export function applyPagination(body, _params) {
  if (body['$paginate'] && _params) {
    if (!body.$options) {
      body.$options = {};
    }

    if (_params.limit) {
      _.extend(body.$options, {
        limit: _params.limit,
      });
    }

    if (_params.skip) {
      _.extend(body.$options, {
        skip: _params.skip,
      });
    }

    delete body['$paginate'];
  }
}

export default async (_body, _params = {}) => {
  let body = deepClone(_body);
  let params = deepClone(_params);

  applyPagination(body, params);
  await applyFilterRecursive(body, params, true);

  return body;
};
