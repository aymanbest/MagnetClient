# MagnetClient

MagnetClient is a Node.js application that allows users to retrieve streaming links for torrent files using magnet links.

## Prerequisites

- Node.js (v12 or higher)
- npm (v6 or higher)

## Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/aymanbest/MagnetClient.git
    cd torrentclient.js
    ```

2. Install the dependencies:
    ```sh
    npm install
    ```

## Usage

1. Start the server:
    ```sh
    node index.js
    ```

2. Make a GET request to the `/get-stream-link` endpoint with a `magnet` query parameter:
    ```sh
    curl "http://localhost:3000/get-stream-link?magnet=YOUR_MAGNET_LINK"
    ```

## Example

Here is an example of how to use the API:

```sh
curl "http://localhost:3000/get-stream-link?magnet=magnet:?xt=urn:btih:EXAMPLE_HASH&dn=example"