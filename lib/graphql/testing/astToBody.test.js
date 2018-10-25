import { assert } from 'chai';
import astToBody, { Symbols } from '../lib/astToBody';
import ast from './ast.js';

describe('#astToBody', function() {
  it('Should properly parse the body with arguments and such', function() {
    const result = astToBody(ast);

    assert.equal(result.fullname, 1);
    assert.isObject(result.comments);

    const commentArgs = result.comments[Symbols.ARGUMENTS];
    assert.equal(commentArgs.approved, true);

    assert.equal(result.comments.text, 1);
    assert.isObject(result.comments.user);
    assert.equal(result.comments.user.firstname, 1);
  });
});
