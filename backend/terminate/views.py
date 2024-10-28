from django.shortcuts import render
from django.http import JsonResponse
from datetime import datetime, timedelta
import boto3
import os
from django.views.decorators.csrf import csrf_exempt
import json


def index(request):
    return render(request, 'frontend/build/index.html')


@csrf_exempt
def terminate_instances(request):
    if request.method == 'POST':
        try:
            # Parse JSON data from the request body
            data = json.loads(request.body)
            tag_key = data.get('tagKey')
            tag_value = data.get('tagValue')

            if not tag_key or not tag_value:
                return JsonResponse({'message': 'Tag key and value are required'}, status=400)

            # Read AWS credentials and region from environment variables
            aws_access_key_id = os.getenv('AWS_ACCESS_KEY_ID')
            aws_secret_access_key = os.getenv('AWS_SECRET_ACCESS_KEY')
            aws_region = os.getenv('AWS_DEFAULT_REGION', 'us-east-1')  # Default to 'us-east-1' if not set

            # if not aws_access_key_id or not aws_secret_access_key:

            #     return JsonResponse({'message': 'AWS credentials are not set'}, status=500)

            ec2 = boto3.client(
                'ec2',
                region_name=aws_region,
                aws_access_key_id=aws_access_key_id,
                aws_secret_access_key=aws_secret_access_key
            )

            response = ec2.describe_instances(Filters=[{'Name': f'tag:{tag_key}', 'Values': [tag_value]}])

            # Check if there are any instances with the specified tag
            instance_ids = [instance['InstanceId'] for reservation in response['Reservations'] for instance in reservation['Instances']]
            
            if not instance_ids:
                return JsonResponse({'message': 'No instances found with the specified tag'}, status=404)

            # Terminate instances
            ec2.terminate_instances(InstanceIds=instance_ids)
            
            return JsonResponse({'message': f'Terminated EC2 Instances: {", ".join(instance_ids)}'}, status=200)

        except json.JSONDecodeError:
            return JsonResponse({'message': 'Invalid JSON format'}, status=400)
    
    return JsonResponse({'message': 'Invalid request method'}, status=405)


def cleanup_elastic_ips(request):
    if request.method == 'POST':
        retention_days = request.POST.get('retentionDays')
        if not retention_days:
            return JsonResponse({'message': 'Retention days are required'}, status=400)

        try:
            retention_days = int(retention_days)
        except ValueError:
            return JsonResponse({'message': 'Retention days must be an integer'}, status=400)

        aws_access_key_id = os.getenv('AWS_ACCESS_KEY_ID')
        aws_secret_access_key = os.getenv('AWS_SECRET_ACCESS_KEY')
        aws_region = os.getenv('AWS_DEFAULT_REGION', 'us-east-1')

        if not aws_access_key_id or not aws_secret_access_key:
            return JsonResponse({'message': 'AWS credentials are not set'}, status=500)

        ec2 = boto3.client(
            'ec2',
            region_name=aws_region,
            aws_access_key_id=aws_access_key_id,
            aws_secret_access_key=aws_secret_access_key
        )

        response = ec2.describe_addresses()
        retention_period = datetime.now() - timedelta(days=retention_days)
        released_ips = []

        for address in response['Addresses']:
            # Check if the IP is not associated and is older than the retention period
            if 'AssociationId' not in address and address['AllocationTime'].replace(tzinfo=None) < retention_period:
                ec2.release_address(AllocationId=address['AllocationId'])
                released_ips.append(address['PublicIp'])

        if released_ips:
            return JsonResponse({'status': 'success', 'message': f'Released Elastic IPs: {", ".join(released_ips)}'})
        else:
            return JsonResponse({'status': 'info', 'message': 'No Elastic IPs to release.'})

    return JsonResponse({'message': 'Invalid request method'}, status=405)
