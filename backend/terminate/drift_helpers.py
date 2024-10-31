from .aws_helpers import (get_aws_resources)
from .state_helpers import (get_state_file_resources)

def get_drift_data(state_directory):
    supported_services = [
        "aws_instance", "aws_s3_bucket", "aws_db_instance", "aws_iam_role", 
        "aws_autoscaling_group", "aws_vpc", "aws_lambda_function", 
        "aws_dynamodb_table", "aws_lb", "aws_ebs_volume", "aws_eip", 
        "aws_ecr_repository", "aws_cloudfront_distribution", "aws_efs_file_system", 
        "aws_sns_topic", "aws_sqs_queue", "aws_elastic_beanstalk_environment", 
        "aws_sfn_state_machine", "aws_glue_job", "aws_secretsmanager_secret", 
        "aws_elasticache_cluster", "aws_redshift_cluster", "aws_sagemaker_model", 
        "aws_kinesis_stream", "aws_codepipeline", "aws_codebuild_project", 
        "aws_codedeploy_app", "aws_mq_broker", "aws_workspaces_workspace"]
    
    aws_resources=get_aws_resources()
    state_file_resources = get_state_file_resources(state_directory)
    drift_data = {}
    for service in supported_services:
        only_in_aws, only_in_state, differences = compare_resources(aws_resources, state_file_resources, service)
        drift_data[service] = {
            "only_in_aws": list(only_in_aws),
            "only_in_state": list(only_in_state),
            "differences": differences
        }

    return drift_data

def compare_resources(aws_resources, state_file_resources, resource_type):
    aws_resource_ids = set(aws_resources[resource_type].keys())
    state_resource_ids = set(state_file_resources[resource_type].keys())

    only_in_aws = aws_resource_ids - state_resource_ids
    only_in_state = state_resource_ids - aws_resource_ids
    common_resources = aws_resource_ids & state_resource_ids
    # print(common_resources)

    differences = {}
    # for resource_id in common_resources:
    #     aws_resource = aws_resources[resource_type][resource_id]
    #     state_resource = state_file_resources[resource_type][resource_id]
    #     # Comparing each field and storing differences
    #     if aws_resource != state_resource:
    #         differences[resource_id] = {'AWS': aws_resource, 'StateFile': state_resource}

    return only_in_aws, only_in_state, differences