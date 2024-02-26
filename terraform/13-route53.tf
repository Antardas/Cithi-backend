resource "aws_route53_zone" "primary" {
  name = "chithi.localhost" # Replace with your desired domain name
  tags = {
    Name = "Terraform Managed Hosted Zone"
  }
}
# Get your already created hosted zone
data "aws_route53_zone" "main" {
  name         = "chithi.localhost"
  private_zone = false
  depends_on   = [aws_route53_zone.primary]
}
