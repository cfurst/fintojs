# fintojs

An implementation of https://github.com/threadwaste/finto for nodejs 

please see the above link for docs and information on how to use.

This has not been published to npm yet (may not be...)

So clone or download and then just set up the network alias as descirbed in the docs linked above (I have only tested with `ifconfig lo0 alias..` not sure about the other stuff)

also this version is missing the command line options so it defaults to listen on 196.254.196.254 and only defaults are available (like $HOME/.fintorc for example.. sorry)

First draft so please report issues.

### SYNOPSIS
```bash
$sudo node fintojs.js
```
This should work with all the helpers, but I haven't tested them all so report issues as you see them we'll try and reproduce. I also may have missed features. Please report those also.
