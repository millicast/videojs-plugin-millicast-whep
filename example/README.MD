# Millicast Example using VideoJS WHEP plugin

This example shows how to use the VideoJS WHEP plugin to play a stream from Millicast.

### Requirements

An available WHEP url. This can be provided via enviroment variable or query parameter.

#### Environment variables

Add a `.env` file in current path. You can find the following example in `.env.sample`:

```sh
VITE_WHEP_URL
```

#### Query parameters

| Parameter | Description |
| --- | --- |
| **whepUrl**  | WHEP url |

### Project setup

Install all dependencies using the following command:

    ```
    npm install
    ```

### Compiles and hot-reloads for development

To start running this demo, the following command will publish the app at `http://localhost:5173`.

    ```
    npm run dev
    ```
