# Gpnmarket front

# Installation

The following instructions use the variable `$GPNMARKET_FRONT` as the path to the project

```bash
export GPNMARKET_FRONT=~/gpnmarket-front
```

## Through the docker

Repository cloning:

```bash
git clone git.etpgpb.loc:newetp/gpnmarket-front.git $GPNMARKET_FRONT
```

The next step is to configure the environment:

```bash
cd $GPNMARKET_FRONT/docker
cp .env.dist .env
$EDITOR .env
```

Perform configuration of the frontend:  

```bash
cd $GPNMARKET_FRONT/www
cp src/app/config/app.config.ts.dist src/app/config/app.config.ts 
$EDITOR src/app/config/app.config.ts 
```

Once set up, you can build and run:

```bash
cd $GPNMARKET_FRONT/docker
docker-compose build
docker-compose up -d
```

During assembly and start-up the following will be done

1. Installation of the container with nodejs 8.
2. In the container installing angular-cli and forever packages
3. Installing dependencies
4. Launch the project in development mode

**Dependencies are installed during the first run and will take some time to install:

```bash
docker attach $ANGULAR_CONTAINER_NAME # имя контейнера из .env
```

And it will be possible to check the angular server running from the docker container with the command:

```bash
forever logs 0
```

The output should end with the notation: `Compiled successfully.`

If all went well, the project should be available at `http://localhost:4200` (or at the port specified in the `docker/.env` file)

[Angular server management with forever](docs/forever.md)

## Without the docker

Requirements:

* nodejs >= 8
* angular-cli

Установка anglular-cli:

```bash
npm install --global @angular/cli
```

Repository cloning:

```bash
git clone git.etpgpb.loc:newetp/gpnmarket-front.git $GPNMARKET_FRONT
```

Perform configuration of the frontend:

```bash
cd $GPNMARKET_FRONT/www
cp src/app/config/app.config.ts.dist src/app/config/app.config.ts 
$EDITOR src/app/config/app.config.ts 
```

Сборка и запуск:

```bash
cd $GPNMARKET_FRONT/www
npm install
npm start
```

The output should end with the entry: `Compiled successfully.`

If all went well, the project should be available at `http://localhost:4200`

## Configuring the main nginx

To combine server and front end on the same domain, configure nginx on the main system.

First select the local domain, for example gpnmarket.gpb.local, and make a new entry in the hosts:

```
127.0.0.1 gpnmarket.gpb.local
```

Then we create the nginx config:

```
server {
    server_name gpnmarket.gpb.local;
    listen 86;
    client_max_body_size       10m;
    client_body_buffer_size    128k;
    location / {
        proxy_pass http://localhost:4202/; # адрес сервера gpnmarket_angular
    }
    location /api/ {
        proxy_pass http://localhost:8092/; # адрес сервера с gpnmarket-nginx
    }
    
    # Проброс websocket-а для перезагрузки angular в процессе разработки:
    location /sockjs-node/ {
        proxy_pass http://localhost:4202/sockjs-node/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

# Run to work with the remote backend at processor-test.isource.ru
1) npm run start:cross


# Run to work with a remote backend on processor-preprod.isource.ru
1) In app.config.ts, replace all '-test' with '-preprod' and the line: 
clientId: 'gpnmarket-loc' 
to
clientId: 'gpnmarket-preprod' 
2) npm run start:cross:preprod

# Build for the test server

The command to build:

```bash
cd $GPNMARKET_FRONT/www
npm run build
```

The results of the build will be available in the folder `$GPNMARKET_FRONT/www/dist`

# Release build

Build command:

```bash
cd $GPNMARKET_FRONT/www
npm run build -- --prod
```

The results of the build will be available in the folder `$GPNMARKET_FRONT/www/dist`.

If you get a 404 error for the configured virtual servers with built applications, you should add to the configuration file of the virtual server:

```
        location / {
                try_files $uri /index.html;
        }     
```

#Starting e2e tests

To run e2e tests locally you need to:

1. Copy the file www/e2e/protractor.conf.js.dist to the same directory without .dist
2. In the copied file protractor.conf.js you must:
 - in const baseUrl specify the local address of the application;
 - In params specify login and password for the client and backoffice, and also the parameter user (name, which is displayed in the upper right corner after the login) 
3. Run autotests
```bash
ng e2e
```
If the project is not built on port 4200 by default, start it with the configured port, for example
```bash
ng e2e --port 4201
```
# Style guide for naming routers

- Routes for a struct module that provides several actions, must be partitioned with the children parameter

    **Wrong**
    ```js
    {path: 'users', component: UserListComponent},
    {path: 'users/:id', component: UserShowComponent},
    ```
    **Right**
    ```js
    {path: 'users', component: UserListComponent, children [
        {path: ':id', component: UserShowComponent},
    ]},
    ```

- it is suggested to use the plural for entity roots, which represent collections

    **Wrong**
    ```js
    {path: 'user', component: UserListComponent},
    ```
    **Right**
    ```js
    {path: 'users', component: UserListComponent},
    ```

- The naming of the components is suggested using the following action words:

    - `list` for list 
    - `showing` for browsing
    - `editing` for editing
    - `creating` to create
    
    **Example**
    ```bash
    Component naming:
    
    UserListComponent
    UserShowingComponent
    UserEditingComponent
    UserCreatingComponent
    ```

- For each router that is protected by AccessGuard, we must define a routerId. 
  This parameter must match the route_id field in the database.  
  A naming system is suggested for the generality of the routeId name. The router name consists of
   entity name and action separated by a dot character `.`. The words denoting the action, 
   we use the same as for naming components.

    **Example**
    ```js
    {path: 'users', component: UserListComponent, data: { routeId: 'users.list' }, children [
        {path: 'create', component: UserCreateComponent}, data: { routeId: 'users.create' }
        {path: ':id', component: UserShowComponent}, data: { routeId: 'users.show' }
        {path: ':id/edit', component: UserEditComponent}, data: { routeId: 'users.edit' }
    ]},
    ```
    
- If the name of the root consists of several words, then we separate the words with the symbol ``-``

    **Example**
    ```js
    {path: 'users-for-example', component: UserListComponent}
    ```


Login in:

cmfqgkwdd@mailinator.com
!q2w3e4R1234
