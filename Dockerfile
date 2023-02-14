# take default image of node boron i.e  node 9.x
FROM node:9.11.1

MAINTAINER christina <christinadivya.P@optisolbusiness.com>

RUN yarn global add gulp node-gyp pm2
 

# create app directory in container
RUN mkdir -p /home/ubuntu/projects/fetch39/

# set /app directory as default working directory
WORKDIR /home/ubuntu/projects/fetch39/

# only copy package.json initially so that `RUN yarn` layer is recreated only
# if there are changes in package.json
ADD package.json yarn.lock /home/ubuntu/projects/fetch39/

# --pure-lockfile: Don’t generate a yarn.lock lockfile
RUN yarn --pure-lockfile

# copy all file from current dir to /app in container
COPY . /home/ubuntu/projects/fetch39/

# expose port 9001
EXPOSE 9001

# cmd to start service
CMD [ "yarn", "start"]
