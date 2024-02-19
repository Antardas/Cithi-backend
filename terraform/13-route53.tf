resource "aws_route53_zone" "primary" {
  name = "chithi.localhost" # Replace with your desired domain name
  tags = {
    Name = "Terraform Managed Hosted Zone"
  }
}
# Get The Create Hosted Zone
data "aws_route53_zone" "main" {
  name         = var.main_api_server_domain
  private_zone = false
}
