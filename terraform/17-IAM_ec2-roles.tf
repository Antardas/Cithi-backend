resource "aws_iam_role" "ec2_iam_role" {
  name = var.ec2_iam_role_name
  assume_role_policy = jsonencode({
    Version : "2012-10-17",
    Statement : [
      {
        Action : "sts:AssumeRole"
        Effect : "Allow"
        Principle : {
          Service : [
            "ec2.amazonaws.com", "application-autoscaling.amazonaws.com"
          ]
        }
      }
    ]
  })
}

resource "aws_iam_role_policy" "ec2_iam_role_policy" {
  name = var.ec2_iam_role_policy_name
  role = aws_iam_role.ec2_iam_role.id
  policy = jsonencode({
    "Version" : "2012-10-17",
    "Statement" : [
      {
        "Action" : [
          "ec2:*",
          "s3:*",
          "elasticloadbalancing:*",
          "cloudwatch:*",
          "logs:*",
          "autoscaling:*",
          "sns:Publish",
          "tag:GetResources"
        ]
        "Effect" : "Allow",
        "Resource" : "*"
      }
    ]
  })
}


resource "aws_iam_instance_profile" "ec2_instance_profile" {
  name = var.ec2_instance_profile_name
  role = aws_iam_role.ec2_iam_role.name
}
