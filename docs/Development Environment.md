# Development Environment

Here are the steps to set up the development environment for the project. The easiest way to set up the development environment is to use Visual Studio Code with Remote Containers extension. This will create a Docker container with all the necessary tools and dependencies.

## Visual Studio Code with Remote Containers

1. Install [Docker](https://docs.docker.com/get-docker/) and run it
2. Install [Visual Studio Code](https://code.visualstudio.com/)
3. Install [Remote - Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) extension for Visual Studio Code
4. Open the project in Visual Studio Code and execute (`Ctrl+Shift+P` or `Cmd+Shift+P`) the command `Reopen in Container`

## Install SSL Certificate

### Mac
1. Open Keychain Access (Cmd + Space, then type "Keychain Access").
2. Go to Certificates (left sidebar).
3. Find your certificate (localhost or your custom domain).
4. Double-click it → Expand Trust → Set "Always Trust".
5. Restart your browser and try again.
6. Add vidya.dev to /etc/hosts
