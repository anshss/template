This contains a template for containerizing a next app with a monitoring service
Port 3000 is for the app and 9100 for the monitoring service
<br/>

## Getting started

To locally build and use the app

```bash
docker build -t username/image-name .
docker run -p 3000:3000 -p 9100:9100 username/image-name
```

<br/>

To pull from docker and use the app
```bash
docker pull anshs/orch-app:v2
docker run -p 3000:3000 -p 9100:9100 anshs/orch-app:v2
```