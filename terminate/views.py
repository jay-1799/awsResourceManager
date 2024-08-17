# # from django.shortcuts import render
# from django.shortcuts import render
# from django.http import JsonResponse
# import boto3

# def index(request):
#     return render(request, 'terminate/index.html')

# def terminate_instances(request):
#     if request.method == 'POST':
#         tag_key = request.POST.get('tagKey')
#         tag_value = request.POST.get('tagValue')

#         if not tag_key or not tag_value:
#             return JsonResponse({'message': 'Tag key and value are required'}, status=400)

#         ec2 = boto3.client('ec2', region_name='us-east-1')

#         response = ec2.describe_instances(Filters=[{'Name': f'tag:{tag_key}', 'Values': [tag_value]}])

#         if not response['Reservations']:
#             return JsonResponse({'message': 'No instances found with the specified tag'}, status=404)

#         instance_ids = [instance['InstanceId'] for reservation in response['Reservations'] for instance in reservation['Instances']]

#         ec2.terminate_instances(InstanceIds=instance_ids)
        
#         return JsonResponse({'message': f'Terminated EC2 Instances: {", ".join(instance_ids)}'}, status=200)

#     return JsonResponse({'message': 'Invalid request method'}, status=405)

# from django.shortcuts import render
from django.shortcuts import render
from django.http import JsonResponse
from datetime import datetime, timedelta
import boto3
import os

def index(request):
    return render(request, 'terminate/index.html')

def terminate_instances(request):
    if request.method == 'POST':
        tag_key = request.POST.get('tagKey')
        tag_value = request.POST.get('tagValue')

        if not tag_key or not tag_value:
            return JsonResponse({'message': 'Tag key and value are required'}, status=400)

        # Read AWS credentials and region from environment variables
        aws_access_key_id = os.getenv('AWS_ACCESS_KEY_ID')
        aws_secret_access_key = os.getenv('AWS_SECRET_ACCESS_KEY')
        aws_region = os.getenv('AWS_DEFAULT_REGION', 'us-east-1')  # Default to 'us-east-1' if not set

        if not aws_access_key_id or not aws_secret_access_key:
            return JsonResponse({'message': 'AWS credentials are not set'}, status=500)

        ec2 = boto3.client(
            'ec2',
            region_name=aws_region,
            aws_access_key_id=aws_access_key_id,
            aws_secret_access_key=aws_secret_access_key
        )

        response = ec2.describe_instances(Filters=[{'Name': f'tag:{tag_key}', 'Values': [tag_value]}])

        if not response['Reservations']:
            return JsonResponse({'message': 'No instances found with the specified tag'}, status=404)

        instance_ids = [instance['InstanceId'] for reservation in response['Reservations'] for instance in reservation['Instances']]

        ec2.terminate_instances(InstanceIds=instance_ids)
        
        return JsonResponse({'message': f'Terminated EC2 Instances: {", ".join(instance_ids)}'}, status=200)

    return JsonResponse({'message': 'Invalid request method'}, status=405)

def cleanup_elastic_ips(ec2_client, retention_days):
    """
    Cleans up Elastic IPs that have been allocated but not associated with any resources for the specified number of days.
    Returns a list of released Elastic IPs.
    """
    response = ec2_client.describe_addresses()
    retention_period = datetime.now() - timedelta(days=retention_days)
    released_ips = []

    for address in response['Addresses']:
        if 'AssociationId' not in address and address['AllocationTime'].replace(tzinfo=None) < retention_period:
            ec2_client.release_address(AllocationId=address['AllocationId'])
            released_ips.append(address['PublicIp'])

    return released_ips