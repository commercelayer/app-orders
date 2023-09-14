# App Orders

Commerce Layer application for managing orders. 
Any Commerce Layer account comes with a hosted version of this application, as part of the Dashboard HUB, and it is automatically enabled for admin role.
An admin can then enable the app for other organization members giving each member full access to all app capabilities or read only access.

It's possible to fork this app and add it to your Dashboard HUB, in order to customize every part of the code and start using your own and self-hosted version.


## Getting started
You need a local Node.JS (version 18+) environment and some React.JS knowledge to customize the app code.

1. Fork [this repository](https://github.com/commercelayer/app-orders) (you can learn how to do this [here](https://help.github.com/articles/fork-a-repo)).

2. Clone the forked repository like so:

```bash
git clone https://github.com/<your username>/app-orders.git && cd app-orders
```

3. (Optional) Set your environment with `.env.local` starting from `.env.local.sample`.

4. Install dependencies and run the development server:

```
pnpm install
pnpm dev
```

5. The app will run in development mode at the following address `http://localhost:5173/`. 
In order to authenticate the app, you need to add an integration access token as URL query param. Example: `http://localhost:5173/?accessToken=<integration-token-for-local-dev>`.
Integration access token is only required (and will work only) for development mode. In production mode the Commerce Layer Dashboard HUB will generate a valid access token, base on the current user,

6. Deploy the forked repository to your preferred hosting service. You can deploy with one click below:

[<img src="https://www.netlify.com/img/deploy/button.svg" alt="Deploy to Netlify" height="35">](https://app.netlify.com/start/deploy?repository=https://github.com/commercelayer/app-orders#PUBLIC_SELF_HOSTED_SLUG) [<img src="https://vercel.com/button" alt="Deploy to Vercel" height="35">](https://vercel.com/new/clone?repository-url=https://github.com/commercelayer/app-orders&build-command=pnpm%20build&output-directory=packages%2Fapp%2Fdist&env=PUBLIC_SELF_HOSTED_SLUG&envDescription=your%20organization%20slug) 

7. Complete the configuration in the Dashboard HUB by setting your app URL.
