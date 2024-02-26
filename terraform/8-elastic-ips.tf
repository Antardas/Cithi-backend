resource "aws_eip" "elastic_ip" {
  depends_on = [
    aws_internet_gateway.main_igw
  ]
  vpc =true
  tags = merge(local.common_tags,
    tomap({ "Name" = "${local.prefix}-elastic-IP" })
  )
}
