#!/bin/bash
function program_is_installed {
  local return_=1

  type $1 >/dev/null 2>&1 || {local return_=0;}
  echo "$return_"
}
sudo yum update -y
# check node js install or not if not install then install it
if[ $(program_is_installed node) ==]; then
  curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
  sudo yum install -y nodejs
fi

if[ $(program_is_installed git) ==]; then
  sudo yum install git -y
fi

if[ $(program_is_installed docker) ==]; then
  sudo amzon-linux-extras install docker -y
  sudo systemctl start docker
  sudo docker run --name chatapp-redis -p 6379:6379 always -d redis
fi
if[ $(program_is_installed pm2) ==]; then
  npm install -g pm2
fi

cd /home/ec2-user

git clone -b dev git@github.com:Antardas/Cithi-backend.git

cd Cithi-backend
npm install
aws s3 sync s3://chithi-env-files/develop .

unzip env-file.zip

cp .env.dev .env
npm run build
npm start