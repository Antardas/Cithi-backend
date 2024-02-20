#!/bing/bash

aws s3 sync s3://chithi-env-files/develop .

unzip env-file.zip

cp .env.production .env

rm .env.production

sed -i -e "s|>(^REDIS_HOST=\).*|REDIS_HOST=redis://$ELASTICCACHE_ENDPOINT:6379|g" .env
rm -rf env-file.zip
cp .env .env.production
zip env-file.zip .env.production
aws --region us-east-1 s3 cp env-file.zip s3://chithi-env-files/develop/
rm -rf .env*
rm -rf env-file.zip
