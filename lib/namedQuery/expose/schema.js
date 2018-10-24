import {Match} from 'meteor/check';

export const ExposeDefaults = {
    publication: true,
    method: true,
    unblock: true,
};

export const ExposeSchema = {
    firewall: Match.Maybe(
        Match.OneOf(Function, [Function])
    ),
    publication: Match.Maybe(Boolean),
    unblock: Match.Maybe(Boolean),
    method: Match.Maybe(Boolean),
    embody: Match.Maybe(
        Match.OneOf(Object, Function)
    ),
    validateParams: Match.Maybe(
        Match.OneOf(Object, Function)
    )
};
