resource "aws_alb_target_group" "sever_backend_tg" {
  name                 = "${local.prefix}-tg"
  vpc_id               = aws_vpc.main.id
  port                 = 5000 # API Server Port
  protocol             = "http"
  deregistration_delay = 60

  health_check {
    path                = "/health"
    port                = "traffic-port"
    protocol            = "HTTP"
    healthy_threshold   = 2
    unhealthy_threshold = 10
    interval            = 120
    timeout             = 100
    matcher             = "200"

  }

  stickiness {
    type        = "cookies"
    cookie_name = "token"
  }

   tags = merge(local.common_tags,
    tomap({ "Name" = "${local.prefix}-tg" })
  )
}


