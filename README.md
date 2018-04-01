# fintojs

An implementation of https://github.com/threadwaste/finto for nodejs 

please see the above link for docs and information on how to use.

This has not been published to npm yet (may not be...)

So clone or download and then just set up the network alias as described in the docs linked above (I have only tested with `ifconfig lo0 alias..` not sure about the other stuff)

We have some support for the command line options. `-a --addr`, `-p --port`, and `-c --config` are implemented. `-l --log` is not see the synopsis if you need to write to a file (unix only).

We have not tested this on Windows or Cygwin.

This is currently BETA. Please report any issues.

### SYNOPSIS
```bash
## with a log
$ sudo node fintojs.js > /path/to/log/file 2>&1
## without a log
$ sudo node fintojs.js
## without sudo you would need to customize at least the port:
$ node fintojs.js -p 8080
```
This should work with all the helpers. Please report any issues or mising features (except the logging, of course).