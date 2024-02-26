### Local stack Command
- Create S3 bucker `awslocal s3api create-bucket --bucket chithi-terraform-state`
- List of Bucket `awslocal s3 ls`
- Enable Bucket version `awslocal s3api put-bucket-versioning --bucket chithi-terraform-state --versioning-configuration Status=Enabled`
- Check Bucket version enable or not `awslocal s3api get-bucket-versioning --bucket chithi-terraform-state`
- Create Folder in bucker `awslocal s3api put-object --bucket chithi-terraform-state --key develop`
- Get List of availability zones `awslocal ec2 describe-availability-zones --region us-east-1`

awslocal ec2 create-key-pair \
    --key-name chithiKeyPair \
    --query 'KeyMaterial' \
    --output text | tee key.pem

    vpc-66911985
aws ec2 delete-security-group --group-id vpc-66911985
aws ec2 describe-security-groups
aws ec2 delete-security-group --group-id sg-d43024255beb6fa5b
aws iam delete-role \
    --role-name chithi-server-ec2-role
aws iam remove-role-from-instance-profile \
--instance-profile-name chithi-server-ec2-instance-profile \
--role-name chithi-server-ec2-role

docker compose down
docker compose up -d
aws s3api create-bucket --bucket chithi-terraform-state
aws s3api put-object --bucket chithi-terraform-state --key develop
aws s3api create-bucket --bucket chithi-env-files
aws s3api put-object --bucket chithi-env-files --key develop

aws ec2 create-key-pair \
    --key-name chithiKeyPair \
    --query 'KeyMaterial' \
    --output text | tee key.pem
terraform init -upgrade
terraform plan
terraform apply -auto-approve

aws ec2 describe-images \
    --region us-east-1 \
    --image-ids ami-04681a1dbd79675a5
amzn2-ami-hvm-2.0.20180810-x86_64-gp2
ami-04681a1dbd79675a5

docker tag amazonlinux localstack-ec2/amzn2-ami-hvm-2.0.20180810-x86_64-gp2:ami-04681a1dbd79675a5

docker pull amazonlinux:latest
Solve the EC2 not found issue https://github.com/localstack/localstack/issues/8228
