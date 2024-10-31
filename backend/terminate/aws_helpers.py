import boto3

ec2_client = boto3.client('ec2')
s3_client = boto3.client('s3')
rds_client = boto3.client('rds')
iam_client = boto3.client('iam')
lambda_client = boto3.client('lambda')
cloudformation_client = boto3.client('cloudformation')
dynamodb_client = boto3.client('dynamodb')
elb_client = boto3.client('elbv2')
ecr_client = boto3.client('ecr')
cloudfront_client = boto3.client('cloudfront')
efs_client = boto3.client('efs')
sns_client = boto3.client('sns')
sqs_client = boto3.client('sqs')
elasticbeanstalk_client = boto3.client('elasticbeanstalk')
autoscaling_client = boto3.client('autoscaling')
elasticache_client = boto3.client('elasticache')
secretsmanager_client = boto3.client('secretsmanager')
glue_client = boto3.client('glue')
redshift_client = boto3.client('redshift')
sagemaker_client = boto3.client('sagemaker')
stepfunctions_client = boto3.client('stepfunctions')
kinesis_client = boto3.client('kinesis')
codepipeline_client = boto3.client('codepipeline')
codedeploy_client = boto3.client('codedeploy')
mq_client = boto3.client('mq')
workspaces_client = boto3.client('workspaces')
codebuild_client = boto3.client('codebuild')


aws_resources = {
}
def get_ec2_instances():
    response = ec2_client.describe_instances()
    aws_resources['aws_instance'] = {}
    for reservation in response['Reservations']:
        for instance in reservation['Instances']:
            instance_id = instance.get('InstanceId')
            aws_resources['aws_instance'][instance_id] = {
                        'InstanceType': instance.get('InstanceType'),
                        'State': instance['State'].get('Name'),
                        'Tags': {tag['Key']: tag['Value'] for tag in instance.get('Tags', [])}
                    }

def get_s3_buckets():
    aws_resources['aws_s3_bucket'] = {}
    response = s3_client.list_buckets()
    for bucket in response['Buckets']:
            bucket_name = bucket['Name']
            aws_resources['aws_s3_bucket'][bucket_name] = {'BucketName': bucket_name}

def get_rds_instances():
    aws_resources['aws_db_instance'] = {}
    response = rds_client.describe_db_instances()
    for instance in response['DBInstances']:
        db_identifier = instance.get('DBInstanceIdentifier')
        aws_resources['aws_db_instance'][db_identifier] = {
                    'DBInstanceArn': instance.get('DBInstanceArn'),
                    'DBInstanceClass': instance.get('DBInstanceClass'),
                    'Engine': instance.get('Engine'),
                    'Status': instance.get('DBInstanceStatus')
                }

def get_iam_roles():
    aws_resources['aws_iam_role'] = {}
    response = iam_client.list_roles()
    for role in response['Roles']:
        role_name = role.get('RoleName')
        aws_resources['aws_iam_role'][role_name] = {'RoleName': role['RoleName'], 'RoleArn': role['Arn']}

##############      auto scaling groups ##############
def get_vpcs():
    aws_resources['aws_vpc']={}
    response = ec2_client.describe_vpcs()
    for vpc in response['Vpcs']:
        VpcId=vpc.get('VpcId')
        aws_resources['aws_vpc'][VpcId]={'VpcId': vpc['VpcId'], 'CidrBlock': vpc['CidrBlock']}

def get_lambda_functions():
    aws_resources['aws_lambda_function'] = {}
    response = lambda_client.list_functions()
    for function in response['Functions']:
        function_name = function.get('FunctionName')
        aws_resources['aws_lambda_function'][function_name] = {
            'FunctionArn': function.get('FunctionArn'),
            'Runtime': function.get('Runtime'),
            'Handler': function.get('Handler')
        }
def get_dynamodb_tables():
    aws_resources['aws_dynamodb_table'] = {}
    response = dynamodb_client.list_tables()
    for table_name in response['TableNames']:
        table_description = dynamodb_client.describe_table(TableName=table_name)
        aws_resources['aws_dynamodb_table'][table_name] = {
            'TableArn': table_description['Table']['TableArn'],
            'ItemCount': table_description['Table'].get('ItemCount'),
            'TableStatus': table_description['Table'].get('TableStatus')
        }
def get_load_balancers():
    aws_resources['aws_lb'] = {}
    response = elb_client.describe_load_balancers()
    for lb in response['LoadBalancers']:
        lb_name = lb.get('LoadBalancerName')
        aws_resources['aws_lb'][lb_name] = {
            'LoadBalancerArn': lb.get('LoadBalancerArn'),
            'DNSName': lb.get('DNSName'),
            'State': lb['State'].get('Code')
        }
def get_ebs_volumes():
    aws_resources['aws_ebs_volume'] = {}
    response = ec2_client.describe_volumes()
    for volume in response['Volumes']:
        volume_id = volume.get('VolumeId')
        aws_resources['aws_ebs_volume'][volume_id] = {
            'VolumeType': volume.get('VolumeType'),
            'State': volume.get('State'),
            'Size': volume.get('Size')
        }
def get_elastic_ips():
    aws_resources['aws_eip'] = {}
    response = ec2_client.describe_addresses()
    for address in response['Addresses']:
        allocation_id = address.get('AllocationId')
        aws_resources['aws_eip'][allocation_id] = {
            'PublicIp': address.get('PublicIp'),
            'Domain': address.get('Domain')
        }
def get_ecr_repositories():
    aws_resources['aws_ecr_repository'] = {}
    response = ecr_client.describe_repositories()
    for repository in response['repositories']:
        repo_name = repository.get('repositoryName')
        aws_resources['aws_ecr_repository'][repo_name] = {
            'RepositoryArn': repository.get('repositoryArn'),
            'RepositoryUri': repository.get('repositoryUri')
        }
def get_cloudfront_distributions():
    aws_resources['aws_cloudfront_distribution'] = {}
    response = cloudfront_client.list_distributions()
    for distribution in response['DistributionList']['Items']:
        distribution_id = distribution.get('Id')
        aws_resources['aws_cloudfront_distribution'][distribution_id] = {
            'DomainName': distribution.get('DomainName'),
            'Status': distribution.get('Status')
        }
def get_efs_filesystems():
    aws_resources['aws_efs_file_system'] = {}
    response = efs_client.describe_file_systems()
    for fs in response['FileSystems']:
        fs_id = fs.get('FileSystemId')
        aws_resources['aws_efs_file_system'][fs_id] = {
            'SizeInBytes': fs.get('SizeInBytes'),
            'State': fs.get('LifeCycleState')
        }
def get_sns_topics():
    aws_resources['aws_sns_topic'] = {}
    response = sns_client.list_topics()
    for topic in response['Topics']:
        topic_arn = topic.get('TopicArn')
        aws_resources['aws_sns_topic'][topic_arn] = {'TopicArn': topic_arn}
# def get_sqs_queues():
    
#     response = sqs_client.list_queues()
#     queues = [{'QueueUrl': queue_url} for queue_url in response.get('QueueUrls', [])]
#     return queues
def get_sqs_queues():
    aws_resources['aws_sqs_queue'] = {}
    response = sqs_client.list_queues()

    # Check if 'QueueUrls' exists in the response
    if 'QueueUrls' in response:
        for queue_url in response['QueueUrls']:
            aws_resources['aws_sqs_queue'][queue_url] = {'QueueUrl': queue_url}

def get_elastic_beanstalk_environments():
    aws_resources['aws_elastic_beanstalk_environment'] = {}
    response = elasticbeanstalk_client.describe_environments()
    for environment in response['Environments']:
        env_name = environment.get('EnvironmentName')
        aws_resources['aws_elastic_beanstalk_environment'][env_name] = {
            'EnvironmentArn': environment.get('EnvironmentArn'),
            'Status': environment.get('Status')
        }
def get_step_functions():
    aws_resources['aws_sfn_state_machine'] = {}
    response = stepfunctions_client.list_state_machines()
    for sm in response['stateMachines']:
        sm_name = sm.get('name')
        aws_resources['aws_sfn_state_machine'][sm_name] = {
            'StateMachineArn': sm.get('stateMachineArn'),
            'CreationDate': sm.get('creationDate')
        }
def get_glue_jobs():
    aws_resources['aws_glue_job'] = {}
    response = glue_client.get_jobs()
    for job in response['Jobs']:
        job_name = job.get('Name')
        aws_resources['aws_glue_job'][job_name] = {
            'JobArn': job.get('JobArn'),
            'Role': job.get('Role'),
            'CreatedOn': job.get('CreatedOn')
        }
def get_secrets_manager_secrets():
    aws_resources['aws_secretsmanager_secret'] = {}
    response = secretsmanager_client.list_secrets()
    for secret in response['SecretList']:
        secret_name = secret.get('Name')
        aws_resources['aws_secretsmanager_secret'][secret_name] = {
            'SecretArn': secret.get('ARN'),
            'CreatedDate': secret.get('CreatedDate')
        }
def get_elasticache_clusters():
    aws_resources['aws_elasticache_cluster'] = {}
    response = elasticache_client.describe_cache_clusters()
    for cluster in response['CacheClusters']:
        cluster_id = cluster.get('CacheClusterId')
        aws_resources['aws_elasticache_cluster'][cluster_id] = {
            'Engine': cluster.get('Engine'),
            'Status': cluster.get('CacheClusterStatus'),
            'NodeType': cluster.get('CacheNodeType')
        }
def get_redshift_clusters():
    aws_resources['aws_redshift_cluster'] = {}
    response = redshift_client.describe_clusters()
    for cluster in response['Clusters']:
        cluster_id = cluster.get('ClusterIdentifier')
        aws_resources['aws_redshift_cluster'][cluster_id] = {
            'ClusterStatus': cluster.get('ClusterStatus'),
            'NodeType': cluster.get('NodeType'),
            'DBName': cluster.get('DBName')
        }
def get_auto_scaling_groups():
    aws_resources['aws_autoscaling_group'] = {}
    response = autoscaling_client.describe_auto_scaling_groups()
    for group in response['AutoScalingGroups']:
        group_name = group.get('AutoScalingGroupName')
        aws_resources['aws_autoscaling_group'][group_name] = {
            'MinSize': group.get('MinSize'),
            'MaxSize': group.get('MaxSize'),
            'DesiredCapacity': group.get('DesiredCapacity')
        }
def get_sagemaker_models():
    aws_resources['aws_sagemaker_model'] = {}
    response = sagemaker_client.list_models()
    for model in response['Models']:
        model_name = model.get('ModelName')
        aws_resources['aws_sagemaker_model'][model_name] = {
            'ModelArn': model.get('ModelArn'),
            'CreationTime': model.get('CreationTime')
        }
def get_kinesis_streams():
    aws_resources['aws_kinesis_stream'] = {}
    response = kinesis_client.list_streams()
    for stream_name in response['StreamNames']:
        stream_description = kinesis_client.describe_stream(StreamName=stream_name)
        aws_resources['aws_kinesis_stream'][stream_name] = {
            'StreamARN': stream_description['StreamDescription']['StreamARN'],
            'StreamStatus': stream_description['StreamDescription']['StreamStatus']
        }
def get_codepipeline_pipelines():
    aws_resources['aws_codepipeline'] = {}
    response = codepipeline_client.list_pipelines()
    for pipeline in response['pipelines']:
        pipeline_name = pipeline.get('name')
        aws_resources['aws_codepipeline'][pipeline_name] = {
            'PipelineArn': pipeline.get('pipelineArn'),
            'Created': pipeline.get('created')
        }
def get_codebuild_projects():
    aws_resources['aws_codebuild_project'] = {}
    response = codebuild_client.list_projects()
    for project_name in response['projects']:
        project_details = codebuild_client.batch_get_projects(names=[project_name])
        aws_resources['aws_codebuild_project'][project_name] = {
            'ProjectArn': project_details['projects'][0]['arn'],
            'SourceType': project_details['projects'][0]['source']['type']
        }
def get_codedeploy_applications():
    aws_resources['aws_codedeploy_app'] = {}
    response = codedeploy_client.list_applications()
    for app_name in response['applications']:
        aws_resources['aws_codedeploy_app'][app_name] = {
            'ApplicationName': app_name
        }
def get_mq_brokers():
    aws_resources['aws_mq_broker'] = {}
    response = mq_client.list_brokers()
    for broker in response['BrokerSummaries']:
        broker_id = broker.get('BrokerId')
        aws_resources['aws_mq_broker'][broker_id] = {
            'BrokerName': broker.get('BrokerName'),
            'BrokerArn': broker.get('BrokerArn'),
            'DeploymentMode': broker.get('DeploymentMode')
        }
def get_workspaces():
    aws_resources['aws_workspaces_workspace'] = {}
    response = workspaces_client.describe_workspaces()
    for workspace in response['Workspaces']:
        workspace_id = workspace.get('WorkspaceId')
        aws_resources['aws_workspaces_workspace'][workspace_id] = {
            'State': workspace.get('State'),
            'UserName': workspace.get('UserName')
        }
def get_aws_resources():
    get_ec2_instances()
    get_s3_buckets()
    get_rds_instances()
    get_iam_roles()
    get_auto_scaling_groups()
    get_vpcs()
    get_lambda_functions()
    get_dynamodb_tables()
    get_load_balancers()
    get_ebs_volumes()
    get_elastic_ips()
    get_ecr_repositories()
    get_cloudfront_distributions()
    get_efs_filesystems()
    get_sns_topics()
    get_sqs_queues()
    get_elastic_beanstalk_environments()
    get_step_functions()
    get_glue_jobs()
    get_secrets_manager_secrets()
    get_elasticache_clusters()
    get_redshift_clusters()
    get_auto_scaling_groups()
    get_sagemaker_models()
    get_kinesis_streams()
    get_codepipeline_pipelines()
    get_codebuild_projects()
    get_codedeploy_applications()
    get_mq_brokers()
    get_workspaces()
    return aws_resources