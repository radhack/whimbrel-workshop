# The Whimbrel Workshop

![Whimbrel Silhouette](/public/img/whimbrel-silhouette.png)

[Whimbrel](https://www.allaboutbirds.org/guide/Whimbrel/id) (pronounced wim·bruhl) is a long-distance migrant shorebird with a very long, curved bill which it uses to extract crabs from sand. Amazingly, whimbrels migrate tens of thousands of miles every year.

This workshop is meant to do just that. Integrating Finch with your frontend and backend can be daunting, managing access tokens, handling null data, knowing which API endpoints to call when, etc. But the purpose of this workshop is meant to help you understand that full migration from start to finish, in a hands on way.

This is a pre-built application with a few important code samples left out. By the end of this workshop, you will have added in the necessary components to fully integrate with Finch including the HTTP requests used to receive employer data from the Finch APIs.

This workshop is using a [Next.js](https://nextjs.org/). Since Finch requires having a frontend and a backend for application security reasons, Next.js is perfect platform since it bundles a React.js client-side frontend with a Node.js server-side backend running an API as serverless functions.

## 🚀 Getting Started

### Prerequisites

1. [Register](https://dashboard.tryfinch.com/signup) for a Finch Sandbox Application.
1. Configure the following `Redirect URL` for this application under the "Redirect URIs" section of the "Sandbox" page: `http://localhost:3000/api/finch/callback`
1. Take note of the `Client ID` and `Client Secret`. You'll need these values in the next step. You will need to regenerate the Client Secret the first time before using it.

### Basic Setup

Create a `.env.local` file under your root project directory (or copy our example file by running `cp .env.local.example .env.local` in the terminal).

Define the necessary Finch configuration values as follows:

```
# The base url of your application
BASE_URL=http://localhost:3000

# The base url of Finch APIs
FINCH_API_URL=https://api.tryfinch.com
FINCH_SANDBOX_URL=https://sandbox.tryfinch.com/api

# DO NOT CHANGE - Finch Client Id that allows you to enter any provider credentials during demo
NEXT_PUBLIC_FINCH_DEMO_CLIENT_ID=5dc0e9dc-c411-4e4e-a749-0e35aac43080
FINCH_DEMO_CLIENT_ID=5dc0e9dc-c411-4e4e-a749-0e35aac43080

# Your Finch Redirect Uri for client-side access
NEXT_PUBLIC_FINCH_REDIRECT_URI=http://localhost:3000/api/finch/callback

# Your Finch application Client ID for client-side access
NEXT_PUBLIC_FINCH_CLIENT_ID=

# Your Finch application Client ID for server-side access
FINCH_CLIENT_ID=

# Your Finch application Client Secret for server-side access
FINCH_CLIENT_SECRET=
```

### Start Local Application

1. Start by installing the dependencies of this project: `npm install` or `yarn`.

1. Then, run the development server: `npm run dev` or `yarn dev`.

1. Open [http://localhost:3000](http://localhost:3000) in your browser to see the app running.

### Integrating the Finch Connect SDK

1. Add the `react-finch-connect` package as a dependency: `npm install react-finch-connect` or `yarn add react-finch-connect`.

1. Open the `/components/finch-connect.tsx` file.

1. Import the `useFinchConnect` module.

    ```js
    // finch-connect.tsx line 2
    import { useFinchConnect, ErrorEvent, SuccessEvent, } from 'react-finch-connect';
    ```

1. Inside the `FinchConnect` function,  define an `onSuccess`, `onError`, and `onClose` function.

    ```js
    // finch-connect.tsx line 13
    const onSuccess = async (e: SuccessEvent) => {
        return console.log(e)
    }
    const onError = (e: ErrorEvent) => console.error(e.errorMessage)
    const onClose = () => console.log("User exited Finch Connect")
    ```

1. Since we will want to handle both [embedded](https://developer.tryfinch.com/docs/reference/0b823989afd08-your-application-embeds-finch-connect) and [redirect](https://developer.tryfinch.com/docs/reference/61cff54e1d9b3-your-application-redirects-to-finch-connect) Finch Connect flows, let's define both starting with `redirect`. Every Finch Connect URL starts with `https://connect.tryfinch.com/authorize` followed by the `client_id` which is located in your [Finch Dashboard](https://dashboard.tryfinch.com/login). The `products` are the list of scopes that you want your customers to consent to. The `redirect_uri` tells Finch Connect where to return back to in your application once it is finished. The `sandbox` URL parameter just tells Finch Connect we are in "sandbox" mode. And `state` is commonly used to [prevent XSRF attacks](https://stackoverflow.com/questions/26132066/what-is-the-purpose-of-the-state-parameter-in-oauth-authorization-request#:~:text=The%20state%20parameter,initiated%20the%20request.), but in our case, we can also use it to send a unique identifier based on the customer initiating the connection.

1. Under the `onClose` function, create a `redirectFinchConnect` constant.

    ```js
    // finch-connect.tsx line 17
    const redirectFinchConnect = `https://connect.tryfinch.com/authorize?client_id=${process.env.NEXT_PUBLIC_FINCH_CLIENT_ID}&products=${products.join(' ')}&redirect_uri=${baseUrl}/api/finch/callback&sandbox=true&state=customerId123`
    ```

1. In order to launch Finch Connect in an embedded flow, we will initiate the `useFinchConnect` component, which accepts a couple of options.

    - `clientId`: The same client_id we used in the redirect URL.
    - `products`: The list of scopes the user needs to consent.
    - `sandbox`: Are we in sandbox mode or not?
    - `payrollProvider`: If we want to bypass the provider selector screen, you can pass a payroll provider id and present that provider only.
    - `onSuccess`, `onError`, and `onClose`: defined above. Finch Connect will call these functions depending on what the user selects.

    ```js
    // finch-connect.tsx line 18
    const { open: embeddedFinchConnect } = useFinchConnect({
        clientId: process.env.NEXT_PUBLIC_FINCH_CLIENT_ID ?? '',
        payrollProvider: options?.payroll_provider,
        products: products,
        sandbox: options?.sandbox, // Set sandbox=false if using Dev or Prod credentials
        onSuccess,
        onError,
        onClose
    });
    ```

1. Finally, we return `embeddedFinchConnect` and `redirectFinchConnect` inside an object so they can both be referenced.

    ```js
    // finch-connect.tsx line 28
    return { embeddedFinchConnect, redirectFinchConnect }
    ```

1. Save `finch-connect.tsx`. The browser page auto-updates as you save files.

### Calling the Finch Connect SDK

Now that we have Finch Connect setup, we need to give the user a way to "initiate" Finch Connect. This is normally done through some sort of Call To Action button.

1. Open the `/components/navbar.tsx` file.

1. Import `FinchConnect`.

    ```js
    // navbar.tsx line 7
    import { FinchConnect } from './finch-connect'
    ```

1. Initiate `FinchConnect()`.

    ```js
    // navbar.tsx line 30
    const { embeddedFinchConnect, redirectFinchConnect } = FinchConnect()
    ```

1. Add two new Menu.Item buttons which call their respective `redirectFinchConnect` or `embeddedFinchConnect` when clicked.

    ```js
    // navbar.tsx line 128
    <Menu.Item>
        {({ active }) => (
            <a
                href={redirectFinchConnect}
                className={classNames(active ? 'bg-gray-100 border-t cursor-pointer' : '', 'block px-4 py-2 text-sm text-gray-700 border-t')}
            >
            + Redirect Flow
            </a>
        )}
    </Menu.Item> 
    <Menu.Item>
        {({ active }) => (
            <a
                onClick={() => embeddedFinchConnect()}
                className={classNames(active ? 'bg-gray-100 cursor-pointer' : '', 'block px-4 py-2 text-sm text-gray-700')}
            >
            + Embed Flow
            </a>
        )}
    </Menu.Item> 
    ```

1. Save `navbar.tsx`. The browser page auto-updates as you save files.

1. Run your application using `npm start dev` or `yarn dev`, select the menu button, select `+ Embed Flow`, then follow the prompts. When asked for login credentials for the Sandbox provider, the username=`largeco` and password=`letmein`.

1. If you open up your browser's developer console, you should have seen a response come through containing a temporary authorization code.

    ```js
    TODO: INSERT RESPONSE HERE
    ```

### Exchanging the authorization code for an access token

If Finch Connect successfully connects to the provider, it will close and issue a temporary authorization code to the `onSuccess` event initialized in the FinchConnect function inside `/components/finch-connect.tsx`. This authorization code is not useful for anything besides being exchanged for a long-living access token via the Finch `/auth/token` endpoint. Let's make an API endpoint to exchange the authorization token.

Next.js makes it easy to implement a backend server API by simply adding a file inside the `/pages/api` folder.

1. Create a folder inside `/pages/api` called `/finch`.

1. Create a file inside `/pages/api/finch` called `callback.tsx` and insert this boilerplate function.

    ```js
    import axios from 'axios'
    import type { NextApiRequest, NextApiResponse } from 'next'
    import database from '../../../util/database'

    type FinchTokenRes = {
        access_token: string
    }

    export default async function Callback(req: NextApiRequest, res: NextApiResponse) {
        console.log(req.method + " /api/finch/callback ");

        if (req.method == 'GET') {
            try {

                // your code will go here
                
            } catch (error) {
                console.error(error);
                return res.status(500).json("Error retrieving access token.")
            }
        }

        return res.status(405).json("Method not implemented.")
    };
    ```

1. Map query parameters to variables.

    ```js
    // callback.js line 14
    const code = req.query.code;
    const state = req.query.state
    const embedded = req.query.embedded;
    ```

1. The reason we pass the `embedded` query parameter is to notify our app that it is an embedded Finch Connect flow vs. a redirect Finch Connect flow. We can build out the request body by pulling the `client_id`, `client_secret`, `code` (this is the authorization code), and `redirect_uri` (if using redirect flow). The Redirect Uri also needs to be added to your Finch Dashboard if you haven't already.

    ```js
    // callback.tsx line 18

    // NOTE: embedded Finch Connect flow will fail if redirect_uri is included in the POST body, since it is not needed because, well, it is embedded and not redirecting.
    let body = {};
    if (embedded) {
        body = {
            client_id: process.env.FINCH_CLIENT_ID,
            client_secret: process.env.FINCH_CLIENT_SECRET,
            code: code,
        }
    } else {
        body = {
            client_id: process.env.FINCH_CLIENT_ID,
            client_secret: process.env.FINCH_CLIENT_SECRET,
            code: code,
            redirect_uri: process.env.BASE_URL + "/api/finch/callback"
        }
    }
    ```

1. We can now make the request to Finch. We will call the `POST /auth/token` endpoint and pass our request body.

    ```js
    // callback.tsx line 35
    const authRes = await axios.request<FinchTokenRes>({
        method: 'post',
        url: `${process.env.FINCH_API_URL}/auth/token`,
        data: body
    })
    ```

1. After getting an access token, one of the best endpoints to call is the [/introspect](https://developer.tryfinch.com/docs/reference/eee6e798b0f93-introspect) endpoint. It returns valuable details like `company_id`, `payroll_provider_id`, and `products`. You can use this information later to store the access token properly.

    ```js
    // callback.tsx line 41
    const introRes = await axios({
        method: 'get',
        url: `${process.env.FINCH_API_URL}/introspect`,
        headers: {
            Authorization: `Bearer ${authRes.data.access_token}`,
            'Finch-API-Version': '2020-09-17'
        },
    });
    ```

1. Store the access token you just retrieved. For this demo, we are using the `node-json-db` package as a "stand-in" database to make it easy to store access tokens. Replace `/util/database.ts` with your preference of database.

    ```js
    // callback.tsx line 50
    /*
        This is not secure!
        This is only for demo purposes.
        Storing access tokens in a secure database and retrieved from a backend server is ideal.
    */
    database.setConnectionToken(authRes.data.access_token)
    ```

1. Finally, redirect the user somewhere else. This can be a "Successfully Connected" page or the next step in your onboarding flow.

    ```js
    // callback.tsx line 59
    return res.redirect('/connection');
    ```

1. Now that we have our /callback function working, we can update our finch-connect component to call it. In `/components/finch-connect.tsx`, replace `console.log(e)` in the `onSuccess` function with a request to our `/api/finch/callback` endpoint.

    ```js
    // finch-connect.tsx line 14
    const onSuccess = async (e: SuccessEvent) => {
        return fetch(`/api/finch/callback?code=${e.code}&embedded=${options.embedded}`)
    }
    ```

### Create a new connection

1. Create a new connection by either selecting `Redirect Flow` or `Embed Flow`. Or if you want to skip [Finch Connect](https://developer.tryfinch.com/docs/reference/4a41b0589896f-overview), you can create a `Gusto Sandbox` to start viewing data.

1. Navigate between `Company`, `Directory`, and `Payroll` pages.

### TODO: Create the Directory page

1. TODO: create backend endpoint

1. TODO: create page

1. You have successfully integrated Finch!

### TODO: Convert JSON to CSV

You can download the Finch API data as a CSV file by selecting the download icon next to each section. View the code to convert JSON to CSV in `/pages/api/finch/download`.

### Edit (todo)

### Notes

- This is a typscript application. Finch Data Types can be found in `types/finch.d.ts`.

- This app uses `node-json-db` package as a "stand-in" database to make it easy to store access tokens. Replace `/util/database.ts` with your preference of database.

- This app uses `swr` package to fetch API requests. A global fetcher function is used which includes a progress bar when loading. Editable in `components/layout.tsx` and `pages/_app.tsx`.

- If you want to manually set the `current_connection`, overide the access token located in `./database.json` (after running the application locally).

- Always try to check for null values when displaying data in a user interface `ex: (employee?.email)`

### Using Gitpod (optional)

The benefits of using Gitpod vs running locally is that this entire application can be built completely in a browser - no additional machine software dependencies required.

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#/https://github.com/Finch-API/whimbrel-workshop)

1. Edit the `.env.local` file.

1. Then, run the development server (if it isn't running already): `npm run dev` or `yarn dev`

1. Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.
