terraform {
  backend "s3" {
    bucket           = "chithi-terraform-state"
    key              = "develop/chithi.tfstate"
    region           = "us-east-1"
    encrypt          = true
    force_path_style = true

    endpoint = "http://s3.localhost.localstack.cloud:4566"
  }
}

locals {
  prefix = "${var.prefix}-${terraform.workspace}"

  common_tags = {
    Environment = terraform.workspace
    project     = var.project
    ManageBy    = "Terraform"
    Owner       = "Chithi"
  }

}
output "name_server"  {
  value = "${aws_acm_certificate.dev_cert.domain_validation_options}"
}