### Local stack Command
- Create S3 bucker `awslocal s3api create-bucket --bucket <bucker-name>`
- List of Bucket `awslocal s3 ls`
- Enable Bucket version `awslocal s3api put-bucket-versioning --bucket chithi-terraform-state --versioning-configuration Status=Enabled`
- Check Bucket version enable or not `awslocal s3api get-bucket-versioning --bucket chithi-terraform-state`
- Create Folder in bucker `awslocal s3api put-object --bucket chithi-terraform-state --key develop`