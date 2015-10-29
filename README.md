This project is the beginnings of a Node.js based equivalent of Robomongo.  At this stage it's more a POC, but it does run, connect to localhost, and display a (barely) usable shell.

The key part here is the interaction with the shell (see lib/shell). The idea is to be able to initialize a connection with any recent version of the shell, without exiting the JS environment.

The system works by injecting an initialization script that captures all output from the shell, encoding it in an easily processable format before passing it via standard output. Queries are sent to the injected script where they're evaluated, the results (and any errors) are encoded along with information about the query and passed to the parent program for display

__Screenshot:__

![Screenshot](http://i.imgur.com/tquUuAg.png)