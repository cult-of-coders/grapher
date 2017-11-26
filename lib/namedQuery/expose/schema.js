import {Match} from 'meteor/check';

export const ExposeDefaults = {
    publication: true,
    method: true,
};

export const ExposeSchema = {
    firewall: Match.Maybe(Function),
    publication: Match.Maybe(Boolean),
    method: Match.Maybe(Boolean),
    embody: Match.Maybe(Object),
    schema: Match.Maybe(Object),
};
