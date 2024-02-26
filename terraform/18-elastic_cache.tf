resource "aws_elasticache_subnet_group" "elasticcache_subnet_group" {
  name       = "${local.prefix}-subnet-elasticcache-group"
  subnet_ids = [aws_subnet.private_subnet_a.id, aws_subnet.private_subnet_b.id]
}
# #
resource "aws_elasticache_replication_group" "chithi_redis_cluster" {
  automatic_failover_enabled    = true
  replication_group_id          = "redis"
  node_type                     = var.elasticache_node_type
  replication_group_description = "Elasticache Replication group"
  number_cache_clusters         = 1
  # description = "Elasticache Replication group"
  # description                   = "Redis elasticache replicaiton group"
  parameter_group_name = "default.redis7.x"
  port                 = 6379
  multi_az_enabled     = true
  subnet_group_name    = aws_elasticache_subnet_group.elasticcache_subnet_group.name
  availability_zones = [ var.vpc_availability_zones[0],var.vpc_availability_zones[1]]
  security_group_ids   = [aws_security_group.elastic_cache_sg.id]
  depends_on           = [aws_security_group.elastic_cache_sg]
  engine = "redis"


  # provisioner "local-exec" {
  #   command = file("./userdata/update-env-file.sh")

  #   environment = {
  #     ELASTICCACHE_ENDPOINT = self.primary_endpoint_address
  #   }
  # }

  tags = {
    "Environment"   = "Dev"
  }
}
