# Gpnmarket front

# Установка

В инструкциях далее используется переменная `$GPNMARKET_FRONT` в качестве указания пути к проекту

```bash
export GPNMARKET_FRONT=~/gpnmarket-front
```

## Через docker

Клонирование репозитория:

```bash
git clone git@gitlab.etpgpb.loc:newetp/gpnmarket-front.git $GPNMARKET_FRONT
```

Далее надо выполнить настройку окружения:

```bash
cd $GPNMARKET_FRONT/docker
cp .env.dist .env
$EDITOR .env
```

Выполнить настройку конфигурации фронтэнда:  

```bash
cd $GPNMARKET_FRONT/www
cp src/app/config/app.config.ts.dist src/app/config/app.config.ts 
$EDITOR src/app/config/app.config.ts 
```

После настройки можно выполнять сборку и запуск:

```bash
cd $GPNMARKET_FRONT/docker
docker-compose build
docker-compose up -d
```

Во время сборки и запуска будет выполнена

1. Установка контейнера с nodejs 8.
2. В контейнере установка пакетов angular-cli и forever
3. Установка зависимостей
4. Запуск проекта в режиме разработки

**Установка зависимостей выполняется при первом запуске и займёт некоторое время.** При первом запуске проверить ход установки зависимостей можно при подключении к контейнеру:

```bash
docker attach $ANGULAR_CONTAINER_NAME # имя контейнера из .env
```

И проверить запущенный angular-сервер из docker-контейнера можно будет с помощью команды:

```bash
forever logs 0
```

Вывод должен завершаться записью: `Compiled successfully.`

Если всё прошло хорошо, то проект должен быть доступен по адресу `http://localhost:4200` (или на порту указанном в файле `docker/.env`)

[Управление angular-сервером с помощью forever](docs/forever.md)

## Без docker

Требования:

* nodejs >= 8
* angular-cli

Установка anglular-cli:

```bash
npm install --global @angular/cli
```

Клонирование репозитория:

```bash
git clone git@gitlab.etpgpb.loc:newetp/gpnmarket-front.git $GPNMARKET_FRONT
```

Выполнить настройку конфигурации фронтэнда:

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

Вывод должен завершаться записью: `Compiled successfully.`

Если всё прошло хорошо, то проект должен быть доступен по адресу `http://localhost:4200`

## Настройка основого nginx

Для объединения сервера и фронта на одном домене настраиваем nginx на основной системе.

Сначала выбираем локальный домен, например gpnmarket.gpb.local, и заносим в hosts новую запись:

```
127.0.0.1 gpnmarket.gpb.local
```

Затем создаём конфиг nginx:

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

# Запуск для работы с удаленным бэком на processor-test.isource.ru
1) npm run start:cross


# Запуск для работы с удаленным бэком на processor-preprod.isource.ru
1) в app.config.ts заменяем все '-test' на '-preprod' и строку: 
clientId: 'gpnmarket-loc' 
на
clientId: 'gpnmarket-preprod' 
2) npm run start:cross:preprod

# Сборка для тестового сервера

Команда для сборки:

```bash
cd $GPNMARKET_FRONT/www
npm run build
```

Результаты сборки будут доступны в папке `$GPNMARKET_FRONT/www/dist`

# Релизная сборка

Команда для сборки:

```bash
cd $GPNMARKET_FRONT/www
npm run build -- --prod
```

Результаты сборки будут доступны в папке `$GPNMARKET_FRONT/www/dist`

Если для настроенных виртуальных серверов с собранными приложениями появялется ошибка 404, то нужно в файл настройки вирутального сервера добавить:

```
        location / {
                try_files $uri /index.html;
        }     
```

#Запуск e2e тестов

Для запуска е2е тестов локально необходимо:

1. Скопировать файл www/e2e/protractor.conf.js.dist в эту же директорию без .dist
2. В скопированном файле protractor.conf.js необходимо:
 - в const baseUrl указать локальный адрес приложения;
 - в params указать логин и пароль для заказчика и бэкофиса, а так же параметр user (ФИО, которое отображается в верхнем правом углу после логина) 
3. Запустить автотесты
```bash
ng e2e
```
В случае, если проект по умолчанию собирается не на 4200 порту, то запускать с указанием сконфигурированного порта, например
```bash
ng e2e --port 4201
```
# Style guide именования роутов

- роуты для структурного модуля, который предоставляет несоколько экшенов, 
должны быть разбиты c помощью параметра children

    **Не правильно**
    ```js
    {path: 'users', component: UserListComponent},
    {path: 'users/:id', component: UserShowComponent},
    ```
    **Правильно**
    ```js
    {path: 'users', component: UserListComponent, children [
        {path: ':id', component: UserShowComponent},
    ]},
    ```

- для роутов сущностей, которые представляют коллекции, предлагается использовать множественное число

    **Не правильно**
    ```js
    {path: 'user', component: UserListComponent},
    ```
    **Правильно**
    ```js
    {path: 'users', component: UserListComponent},
    ```

- Именования компонентов предлагается производить с помощью следующих слов действий:

    - `list` для списка 
    - `showing` для просмотра
    - `editing` для редактирования
    - `creating` для создания
    
    **Пример**
    ```bash
    Именования компонентов:
    
    UserListComponent
    UserShowingComponent
    UserEditingComponent
    UserCreatingComponent
    ```

- Для каждого роута, который защищен у нас AccessGuard, мы должны определить routerId. 
  Данный параметр должен соответствовать полю route_id в БД.  
  Для общности названия routeId предлагается система именования. Имя роута состоит из
   названия сущности и действия разделенные символом точки `.`. Слова, обозначающие действие, 
   используем такие же, как для наименования компонентов.

    **Пример**
    ```js
    {path: 'users', component: UserListComponent, data: { routeId: 'users.list' }, children [
        {path: 'create', component: UserCreateComponent}, data: { routeId: 'users.create' }
        {path: ':id', component: UserShowComponent}, data: { routeId: 'users.show' }
        {path: ':id/edit', component: UserEditComponent}, data: { routeId: 'users.edit' }
    ]},
    ```
    
- Если имя роута состоит из нескольких слов, то разделяем слова символом ``-``

    **Пример**
    ```js
    {path: 'users-for-example', component: UserListComponent}
    ```