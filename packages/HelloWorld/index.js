CommandManager.add('hello', 'Says hello world', 'hello', args => {
    Terminal.log('Hello world!'.orange().bold());
});
