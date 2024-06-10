require('ts-node').register({
    project: './tsconfig.json',
    require: ['tsconfig-paths/register'],
});

module.exports = {
    require: 'ts-node/register',
    extension: ['ts'],
    spec: 'test/*.spec.ts',
};