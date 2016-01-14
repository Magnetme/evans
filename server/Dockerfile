FROM node:0.12.9
MAINTAINER Martin Rogalla

# Export the database, originals dir and the config dir
RUN mkdir /opt/evans
RUN mkdir /opt/evans/config

# Evans Server
EXPOSE 8080

# GitHub Webhook
EXPOSE 8081

# Add the dependencies
RUN npm install -g pm2
ADD package.json /opt/evans/package.json
RUN cd /opt/evans && npm install

# Add the application
ADD . /opt/evans/
VOLUME ["/opt/evans/config"]

# Run the entire thing!
WORKDIR /opt/evans
CMD ["pm2", "start", "index.js", "--no-daemon", "--instances=1"]
