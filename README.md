# Shlink Web Client (Thai Edition 🇹🇭)

> A customized, fully Thai-localized fork of [Shlink Web Client](https://github.com/shlinkio/shlink-web-client) by [@Meawkung](https://github.com/Meawkung), featuring **Cloudflare Access Zero Trust Auto-Login** and **Automatic Author Tagging**.

---

## ✨ Features in this Custom Fork

1. **🇹🇭 100% Thai Localization (ภาษาไทยเต็มรูปแบบ)**
   - แปลเมนู ปุ่ม ตาราง กราฟสถิติ ฟอร์มสร้างลิงก์ และหน้าการตั้งค่าทั้งหมดเป็นภาษาไทย

2. **🔐 Cloudflare Access Email Auto-Login (Zero-Touch Auth)**
   - เชื่อมต่อกับ Cloudflare Zero Trust เพื่ออ่าน Header `Cf-Access-Authenticated-User-Email`
   - แจกจ่าย Server Connection และ Scoped API Key ประจำตัวของผู้ใช้ตามอีเมลโดยอัตโนมัติ ไม่ต้องกรอก API Key เองบนอุปกรณ์ใหม่

3. **🏷️ Locked Default Author Tagging (ระบบล็อคแท็กผู้สร้าง)**
   - ดึงชื่อด้านหน้าของ Email (ก่อน `@`) มาเป็น Default Tag ของลิงก์ย่อให้อัตโนมัติ
   - ล็อคแท็กผู้สร้างไว้ถาวร ป้องกันการเผลอลบ เพื่อความแม่นยำในการแยกแยะและ Audit ลิงก์ของ Admin

4. **🐳 Optimized Unprivileged Dockerfile**
   - มาพร้อม `Dockerfile.thai` ที่ Build บน `nginx-unprivileged:alpine` ปลอดภัยและเบา

---

## 🚀 Quick Deployment with Docker

```bash
# 1. Build the customized Thai Web Client image
docker build -f Dockerfile.thai -t shlink-web-client:thai .

# 2. Run with Docker Compose or Docker Run
docker run -d \
  --name shlink-web-client \
  -p 8080:8080 \
  shlink-web-client:thai
```

### From app.shlink.io

The easiest way to use shlink-web-client is by just going to <https://app.shlink.io>.

The application runs 100% in the browser, so you can safely access any shlink instance from there.

### Docker image

If you want to deploy shlink-web-client in a container-based cluster (kubernetes, docker swarm, etc), just pick the [shlinkio/shlink-web-client](https://hub.docker.com/r/shlinkio/shlink-web-client/) image and do it.

It's a lightweight [nginx:alpine](https://hub.docker.com/r/library/nginx/) image serving the static app on port 8080.

### Self-hosted

If you want to self-host it yourself, get the [latest release](https://github.com/shlinkio/shlink-web-client/releases/latest) and download the distributable zip file attached to it (`shlink-web-client_X.X.X_dist.zip`).

The package contains static files only, so just put it in a folder and serve it with the web server of your choice.

**Considerations**:

* Provided dist files are configured to be served from the root of your domain. If you need to serve shlink-web-client from a subpath, you will have to build it yourself following [these steps](#serve-shlink-in-subpath).
* The app has a client-side router that handles dynamic paths. Because of that, you need to configure your web server to fall-back to the `index.html` file when requested files do not exist.
    * If you use Apache, you are covered, since the project includes an `.htaccess` file which already does this.
    * If you use nginx, you can [see how it's done](config/docker/nginx.conf) for the docker image and do the same.

## Pre-configuring servers

The first time you access shlink-web-client from a browser, you will have to configure the list of shlink servers you want to manage, and they will be saved in the local storage.

Those servers can be exported and imported in other browsers, but if for some reason you need some servers to be there from the beginning, starting with shlink-web-client 2.1.0, you can provide a `servers.json` file in the project root folder (the same containing the `index.html`, `favicon.ico`, etc) with a structure like this:

```json
[
  {
    "name": "Main server",
    "url": "https://s.test",
    "apiKey": "09c972b7-506b-49f1-a19a-d729e22e599c"
  },
  {
    "name": "Local",
    "url": "http://localhost:8080",
    "apiKey": "580d0b42-4dea-419a-96bf-6c876b901451"
  }
]
```

> The list can contain as many servers as you need.

If you are using the shlink-web-client docker image, you can mount the `servers.json` file in a volume inside `/usr/share/nginx/html`, which is the app's document root inside the container.

    docker run --name shlink-web-client -p 8000:8080 -v ${PWD}/servers.json:/usr/share/nginx/html/servers.json shlinkio/shlink-web-client
    
Alternatively, you can mount a `conf.d` directory, which in turn contains the `servers.json` file, in a volume inside `/usr/share/nginx/html`. *(since shlink-web-client 3.2.0)*.

    docker run --name shlink-web-client -p 8000:8080 -v ${PWD}/my-config/:/usr/share/nginx/html/conf.d/ shlinkio/shlink-web-client
    
If you want to pre-configure a single server, you can provide its config via env vars. When the container starts up, it will build the `servers.json` file dynamically based on them. *(since shlink-web-client 3.2.0)*.

  * `SHLINK_SERVER_URL`: The fully qualified URL for the Shlink server.
  * `SHLINK_SERVER_API_KEY`: The API key.
  * `SHLINK_SERVER_NAME`: The name to be displayed. Defaults to **Shlink** if not provided.

    ```shell
    docker run \
        --name shlink-web-client \
        -p 8000:8080 \
        -e SHLINK_SERVER_URL=https://s.test \
        -e SHLINK_SERVER_API_KEY=6aeb82c6-e275-4538-a747-31f9abfba63c \
        shlinkio/shlink-web-client
    ```

> **Be extremely careful when using this feature.**
>
> Due to shlink-web-client's client-side nature, the file needs to be accessible from the browser.
>
> Because of that, make sure you use this only when you self-host shlink-web-client, and you know only trusted people will have access to it.
>
> Failing to do this could cause your API keys to end up being exposed.

## Serve project in subpath

Official distributable files have been built so that they are served from the root of a domain.

If you need to host shlink-web-client yourself and serve it from a subpath, follow these steps:

* Download shlink-web-client source code for the version you want to build.
    * For example, if you want to build `v1.0.1`, use this link https://github.com/shlinkio/shlink-web-client/archive/v1.0.1.zip
    * Replace the `v1.0.1` part in the link with the one of the version you want to build.
* Decompress the file and `cd` into the resulting folder.
* Open the `package.json` file in the root of the project, locate the `homepage` property and replace the value (which should be an empty string) by the path from which you want to serve shlink-web-client.
    * For example: `"homepage": "/my-projects/shlink-web-client",`.
* Build the project:
    * For classic hosting:
        * Download [node](https://nodejs.org/en/download/package-manager/) 10.15 or later.
        * Install project dependencies by running `npm install`.
        * Build the project by running `node --run build`.
        * Once the command finishes, you will have a `build` folder with all the static assets you need to run shlink-web-client. Just place them wherever you want them to be served from.
    * For docker image:
        * Download [docker](https://docs.docker.com/install/).
        * Build the docker image by running `docker build . -t shlink-web-client`.
        * Once the command finishes, you will have an image with the name `shlink-web-client`.
