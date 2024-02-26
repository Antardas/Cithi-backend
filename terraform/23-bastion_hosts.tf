resource "aws_instance" "bastion_host" {
  ami                         = "ami-04681a1dbd79675a5"
  instance_type               = var.bastion_host_type
  vpc_security_group_ids      = [aws_security_group.bastion_host_sg.id]
  subnet_id                   = aws_subnet.public_subnet_a.id
  key_name                    = "chithiKeyPair"
  associate_public_ip_address = true
  tags = merge(local.common_tags,
    tomap({ "Name" = "${local.prefix}-bastion-host" })
  )
}


