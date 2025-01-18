import { Plugin } from 'shared-interfaces';

const samplePlugin: Plugin = {
    name: 'Sample Plugin',
    version: '1.0.0',
    author: 'Your Name',
    description: 'A Basic Sample plugin',
    initialize() {
        console.log('Sample Plugin initialized!');
    },
    execute() {
        console.log('Sample Plugin execute!');
    },
    test() {
        console.log('Sample Plugin say Hello World!');
    },
};

export default samplePlugin;
