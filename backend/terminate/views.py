from django.shortcuts import render
from django.http import JsonResponse
from datetime import datetime, timedelta
import boto3
import os
from django.views.decorators.csrf import csrf_exempt
import json
from botocore.exceptions import ClientError
import logging
from .helpers import (
    delete_access_keys,
    delete_signing_certificates,
    delete_login_profile,
    delete_mfa_devices,
    detach_policies,
    delete_inline_policies,
    delete_permission_boundary,
    remove_user_from_groups,
    delete_ssh_public_keys,
    get_owned_amis,
    get_used_amis,
    get_cloudwatch_log_groups,
    get_all_security_groups,
    remove_port_rule_from_security_group

)

from .drift_helpers import (get_drift_data)

logger = logging.getLogger(__name__)

def index(request):
    return render(request, 'frontend/build/index.html')


@csrf_exempt
def fetch_instances(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            tag_key = data.get('tagKey')
            tag_value = data.get('tagValue')

            if not tag_key or not tag_value:
                return JsonResponse({'message': 'Tag key and value are required'}, status=400)

            aws_access_key_id = os.getenv('AWS_ACCESS_KEY_ID')
            aws_secret_access_key = os.getenv('AWS_SECRET_ACCESS_KEY')
            aws_region = os.getenv('AWS_DEFAULT_REGION', 'us-east-1')

            ec2 = boto3.client(
                'ec2',
                region_name=aws_region,
                aws_access_key_id=aws_access_key_id,
                aws_secret_access_key=aws_secret_access_key
            )

            response = ec2.describe_instances(Filters=[{'Name': f'tag:{tag_key}', 'Values': [tag_value]}])
            instance_ids = [instance['InstanceId'] for reservation in response['Reservations'] for instance in reservation['Instances']]

            if not instance_ids:
                return JsonResponse({'message': 'No instances found with the specified tag'}, status=404)

            # Prepare the instance data to return
            instances = [
                {'InstanceId': instance['InstanceId'], 'State': instance['State']}
                for reservation in response['Reservations']
                for instance in reservation['Instances']
            ]

            return JsonResponse({'instances': instances}, status=200)

        except json.JSONDecodeError:
            return JsonResponse({'message': 'Invalid JSON format'}, status=400)

    return JsonResponse({'message': 'Invalid request method'}, status=405)

# Create another view to handle the termination of selected instances
@csrf_exempt
def terminate_selected_instances(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            instance_ids = data.get('instanceIds')

            if not instance_ids:
                return JsonResponse({'message': 'No instances selected for termination'}, status=400)

            # AWS initialization code
            aws_access_key_id = os.getenv('AWS_ACCESS_KEY_ID')
            aws_secret_access_key = os.getenv('AWS_SECRET_ACCESS_KEY')
            aws_region = os.getenv('AWS_DEFAULT_REGION', 'us-east-1')

            ec2 = boto3.client(
                'ec2',
                region_name=aws_region,
                aws_access_key_id=aws_access_key_id,
                aws_secret_access_key=aws_secret_access_key
            )

            ec2.terminate_instances(InstanceIds=instance_ids)
            return JsonResponse({'message': f'Terminated EC2 Instances: {", ".join(instance_ids)}'}, status=200)

        except json.JSONDecodeError:
            return JsonResponse({'message': 'Invalid JSON format'}, status=400)

    return JsonResponse({'message': 'Invalid request method'}, status=405)

@csrf_exempt
def stop_selected_instances(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            instance_ids = data.get('instanceIds')

            if not instance_ids:
                return JsonResponse({'message': 'No instances selected for stopping'}, status=400)

            # AWS initialization code
            aws_access_key_id = os.getenv('AWS_ACCESS_KEY_ID')
            aws_secret_access_key = os.getenv('AWS_SECRET_ACCESS_KEY')
            aws_region = os.getenv('AWS_DEFAULT_REGION', 'us-east-1')

            ec2 = boto3.client(
                'ec2',
                region_name=aws_region,
                aws_access_key_id=aws_access_key_id,
                aws_secret_access_key=aws_secret_access_key
            )

            ec2.stop_instances(InstanceIds=instance_ids)
            return JsonResponse({'message': f'Stopped EC2 Instances: {", ".join(instance_ids)}'}, status=200)

        except json.JSONDecodeError:
            return JsonResponse({'message': 'Invalid JSON format'}, status=400)

    return JsonResponse({'message': 'Invalid request method'}, status=405)


@csrf_exempt
def cleanup_elastic_ips(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        retention_days = data.get('retentionDays')
        if not retention_days:
            return JsonResponse({'message': 'Retention days are required'}, status=400)

        try:
            retention_days = int(retention_days)
        except ValueError:
            return JsonResponse({'message': 'Retention days must be an integer'}, status=400)

        aws_access_key_id = os.getenv('AWS_ACCESS_KEY_ID')
        aws_secret_access_key = os.getenv('AWS_SECRET_ACCESS_KEY')
        aws_region = os.getenv('AWS_DEFAULT_REGION', 'us-east-1')

        # if not aws_access_key_id or not aws_secret_access_key:
        #     return JsonResponse({'message': 'AWS credentials are not set'}, status=500)

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


@csrf_exempt
def cleanup_s3_objects(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        bucket_name = data.get("bucketName")
        retention_period_days = int(data.get("retentionPeriod", 30))  # Default to 30 days if not provided

        s3 = boto3.resource('s3')
        bucket = s3.Bucket(bucket_name)
        retention_cutoff = datetime.now() - timedelta(days=retention_period_days)
        deleted_count = 0

        # Iterate through each object in the bucket
        for obj in bucket.objects.all():
            last_modified = obj.last_modified.replace(tzinfo=None)
            if last_modified < retention_cutoff:
                obj.delete()
                deleted_count += 1  # Count each deleted object

        # Return a JSON response with the result
        message = f"Deleted {deleted_count} objects older than {retention_period_days} days from bucket {bucket_name}."
        return JsonResponse({"message": message})
    else:
        return JsonResponse({"error": "Invalid request method"}, status=400)

@csrf_exempt 
def cleanup_amis(request):
    if request.method == 'POST':
        try:
            # Parse JSON data from request body
            data = json.loads(request.body)
            retention_days = data.get('retentionDays')
            
            if not retention_days:
                return JsonResponse({'message': 'Retention days are required'}, status=400)

            retention_days = int(retention_days)
            cutoff_date = datetime.now() - timedelta(days=retention_days)

            ec2_client = boto3.client(
                'ec2',
                aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
                aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
                region_name=os.getenv('AWS_DEFAULT_REGION', 'us-east-1')
            )

            # Get all AMIs owned by the user
            owned_amis = get_owned_amis(ec2_client)
            used_amis = get_used_amis(ec2_client)

            # Filter unused AMIs older than the retention period
            unused_amis = [
                ami for ami in owned_amis 
                if ami["ImageId"] not in used_amis 
                and datetime.strptime(ami["CreationDate"], "%Y-%m-%dT%H:%M:%S.%fZ") < cutoff_date
            ]

            if not unused_amis:
                return JsonResponse({'message': 'No unused AMIs found to delete.'})

            # Delete eligible AMIs and associated snapshots
            deleted_count = delete_unused_amis(ec2_client, unused_amis)
            return JsonResponse({
                'status': 'success',
                'message': f'Deleted {deleted_count} unused AMI(s) and associated snapshots.'
            })

        except (ValueError, TypeError):
            return JsonResponse({'message': 'Invalid retention days provided'}, status=400)
        
        except (ClientError, boto3.exceptions.Boto3Error) as e:
            logger.error(f"AWS error: {str(e)}")
            return JsonResponse({'message': f'AWS error: {str(e)}'}, status=500)
        
    return JsonResponse({'message': 'Invalid request method'}, status=405)


def delete_unused_amis(ec2_client, unused_amis):
    """Delete unused AMIs and associated snapshots."""
    deleted_count = 0
    for ami in unused_amis:
        ami_id = ami["ImageId"]
        try:
            # Retrieve AMI and associated snapshot information
            image = ec2_client.describe_images(ImageIds=[ami_id])["Images"][0]
            snapshot_ids = [
                block_device["Ebs"]["SnapshotId"]
                for block_device in image.get("BlockDeviceMappings", [])
                if "Ebs" in block_device
            ]

            # Deregister the AMI
            ec2_client.deregister_image(ImageId=ami_id)
            logger.info(f"Deregistered AMI: {ami_id}")

            # Delete associated snapshots
            for snapshot_id in snapshot_ids:
                ec2_client.delete_snapshot(SnapshotId=snapshot_id)
                logger.info(f"Deleted snapshot: {snapshot_id}")

            deleted_count += 1

        except ClientError as e:
            logger.error(f"Failed to delete AMI {ami_id} or its snapshots: {e}")

    return deleted_count



@csrf_exempt
def delete_cloudwatch_logs(request):
    """View to delete CloudWatch log groups older than a specified age."""
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            age_days = data.get("age", 30)  # Default to 30 days 

            # Calculate the threshold date
            threshold_date = datetime.now() - timedelta(days=int(age_days))

            client = boto3.client(
                'logs',
                aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
                aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
                region_name=os.getenv('AWS_DEFAULT_REGION', 'us-east-1')
            )
            log_groups = get_cloudwatch_log_groups(client)

            # Process log groups based on the age threshold
            deleted_groups = []
            failed_deletions = []
            for group in log_groups:
                creation_time = group.get("creationTime", 0) / 1000  # Convert to seconds
                creation_date = datetime.fromtimestamp(creation_time)

                if creation_date < threshold_date:
                    try:
                        client.delete_log_group(logGroupName=group["logGroupName"])
                        deleted_groups.append(group["logGroupName"])
                    except ClientError as e:
                        if e.response["Error"]["Code"] == "AccessDeniedException":
                            failed_deletions.append(group["logGroupName"])
                        else:
                            raise

            
            result_message = (
                f"Deleted {len(deleted_groups)} log groups. "
                f"{len(failed_deletions)} log groups failed due to access denial."
            )
            return JsonResponse({"message": result_message}, status=200)

        except Exception as e:
            return JsonResponse({"message": f"Error: {str(e)}"}, status=500)
    else:
        return JsonResponse({"message": "Invalid request method."}, status=400)


@csrf_exempt
def delete_iam_user_complete(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            user_name = data.get('username')

            client = boto3.client(
                'iam',
                aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
                aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
                region_name=os.getenv('AWS_DEFAULT_REGION', 'us-east-1')
            )

            delete_access_keys(client, user_name)
            delete_signing_certificates(client, user_name)
            delete_login_profile(client, user_name)
            delete_mfa_devices(client, user_name)
            detach_policies(client, user_name)
            delete_inline_policies(client, user_name)
            delete_permission_boundary(client, user_name)
            remove_user_from_groups(client, user_name)
            delete_ssh_public_keys(client, user_name)

    
            client.delete_user(UserName=user_name)
            return JsonResponse({"message": f"User {user_name} deleted successfully."}, status=200)

        except ClientError as e:
            error_code = e.response["Error"]["Code"]
            if error_code == "NoSuchEntity":
                return JsonResponse({"error": f"User {user_name} does not exist."}, status=404)
            else:
                return JsonResponse({"error": str(e)}, status=500)
                
    return JsonResponse({"error": "Invalid request method."}, status=405)
            

@csrf_exempt
def remove_port_from_security_groups(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            port = int(data.get("port", 22))  # Default to port 22 if no port is provided
            client = boto3.client(
                'ec2',
                aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
                aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
                region_name=os.getenv('AWS_DEFAULT_REGION', 'us-east-1')
            )
            security_groups = get_all_security_groups(client)
            affected_groups = 0
            
            for sg in security_groups:
                if remove_port_rule_from_security_group(sg, port,client):
                    affected_groups += 1
            
            return JsonResponse({
                "message": f"Successfully removed port {port} rule from {affected_groups} security groups."
            })
        except Exception as e:
            logger.error(f"Error processing request: {e}")
            return JsonResponse({
                "message": "Failed to remove port from security groups. Please try again."
            }, status=500)
    else:
        return JsonResponse({"message": "Invalid request method."}, status=405)
    
@csrf_exempt
def detect_infrastructure_drift(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            directory = data.get("directory", "")
            
            drift_data = get_drift_data(directory)
            
            response_data = {
                "message": "Infrastructure drift detection completed.",
                "drift_data": drift_data
            }
            return JsonResponse(response_data, status=200)

        except Exception as e:
            return JsonResponse({
                "message": "An error occurred during drift detection.",
                "error": str(e)
            }, status=500)
    else:
        return JsonResponse({"message": "Invalid request method."}, status=405)
