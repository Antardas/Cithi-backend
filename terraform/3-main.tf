terraform {
  backend "s3" {
    bucket  = "chithi-terraform-state"
    key     = "develop/chithi.tfstate"
    region  = var.aws_region
    encrypt = true
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
