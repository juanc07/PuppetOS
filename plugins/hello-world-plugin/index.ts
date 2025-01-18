import { Plugin } from 'shared-interfaces';

const helloWorldPlugin: Plugin = {
    name: 'Hello World Plugin',
    version: '1.0.0',
    author: 'Your Name',
    description: 'A plugin that says "Hello World!" when initialized.',
    initialize() {
        console.log('Hello World Plugin initialized!');
    },
    execute() {
        console.log('Hello World!');
    },
    test() {
        console.log('test Hello World!');
    },
};

export default helloWorldPlugin;
