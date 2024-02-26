resource "aws_acm_certificate" "dev_cert" {
  domain_name       = var.main_api_server_domain
  validation_method = "DNS"
  tags = {
    "Name" : local.prefix
    Environment = terraform.workspace
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_route53_record" "cert_validation_record" {
  allow_overwrite = false
  ttl             = 60
  zone_id         = data.aws_route53_zone.main.id
  count           = length(aws_acm_certificate.dev_cert.domain_validation_options) > 0 ? 1 : 0
  # Use `element()` function to access the first element of the set
  name    = element(aws_acm_certificate.dev_cert.domain_validation_options[*].resource_record_name, 0)
  # Use `element()` function to access the first element of the set
  records = [element(aws_acm_certificate.dev_cert.domain_validation_options[*].resource_record_value, 0)]
  # Use `element()` function to access the first element of the set
  type    = element(aws_acm_certificate.dev_cert.domain_validation_options[*].resource_record_type, 0)
  # Other attributes for the Route 53 record


}


resource "aws_acm_certificate_validation" "cert_validation" {
  certificate_arn         = aws_acm_certificate.dev_cert.arn
 validation_record_fqdns = length(aws_route53_record.cert_validation_record) > 0 ? [aws_route53_record.cert_validation_record[0].fqdn] : []
}
