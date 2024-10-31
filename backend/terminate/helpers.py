import boto3
import logging
from botocore.exceptions import ClientError
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


def get_owned_amis(ec2_client):
    """Retrieve all AMIs owned by the account."""
    owned_amis = []
    paginator = ec2_client.get_paginator("describe_images")
    for page in paginator.paginate(Owners=["self"]):
        owned_amis.extend(page["Images"])
    return owned_amis

def get_used_amis(ec2_client):
    """Retrieve all AMIs currently in use by instances."""
    used_amis = set()
    paginator = ec2_client.get_paginator("describe_instances")
    for page in paginator.paginate():
        for reservation in page["Reservations"]:
            for instance in reservation["Instances"]:
                if "ImageId" in instance:
                    used_amis.add(instance["ImageId"])
    return used_amis

def get_cloudwatch_log_groups(client):
    log_groups = []
    paginator = client.get_paginator("describe_log_groups")
    for page in paginator.paginate():
        log_groups.extend(page["logGroups"])
    return log_groups

def delete_access_keys(iam_client, user_name):
    response = iam_client.list_access_keys(UserName=user_name)
    for access_key in response.get("AccessKeyMetadata", []):
        iam_client.delete_access_key(
            UserName=user_name, AccessKeyId=access_key["AccessKeyId"]
        )


def delete_signing_certificates(iam_client, user_name):
    response = iam_client.list_signing_certificates(UserName=user_name)
    for certificate in response.get("Certificates", []):
        iam_client.delete_signing_certificate(
            UserName=user_name, CertificateId=certificate["CertificateId"]
        )


def delete_login_profile(iam_client, user_name):
    try:
        iam_client.delete_login_profile(UserName=user_name)
    except iam_client.exceptions.NoSuchEntityException:
        pass  # No login profile found


def delete_mfa_devices(iam_client, user_name):
    response = iam_client.list_mfa_devices(UserName=user_name)
    for device in response.get("MFADevices", []):
        iam_client.deactivate_mfa_device(
            UserName=user_name, SerialNumber=device["SerialNumber"]
        )


def detach_policies(iam_client, user_name):
    response = iam_client.list_attached_user_policies(UserName=user_name)
    for policy in response.get("AttachedPolicies", []):
        iam_client.detach_user_policy(UserName=user_name, PolicyArn=policy["PolicyArn"])


def delete_inline_policies(iam_client, user_name):
    response = iam_client.list_user_policies(UserName=user_name)
    for policy_name in response.get("PolicyNames", []):
        iam_client.delete_user_policy(UserName=user_name, PolicyName=policy_name)


def delete_permission_boundary(iam_client, user_name):
    try:
        iam_client.delete_user_permissions_boundary(UserName=user_name)
    except iam_client.exceptions.NoSuchEntityException:
        pass  # No permissions boundary found


def remove_user_from_groups(iam_client, user_name):
    response = iam_client.list_groups_for_user(UserName=user_name)
    for group in response.get("Groups", []):
        iam_client.remove_user_from_group(
            GroupName=group["GroupName"], UserName=user_name
        )


def delete_ssh_public_keys(iam_client, user_name):
    response = iam_client.list_ssh_public_keys(UserName=user_name)
    for ssh_key in response.get("SSHPublicKeys", []):
        iam_client.delete_ssh_public_key(
            UserName=user_name, SSHPublicKeyId=ssh_key["SSHPublicKeyId"]
        )


def get_all_security_groups(client):
    try:
        security_groups = []
        paginator = client.get_paginator("describe_security_groups")
        for page in paginator.paginate():
            security_groups.extend(page["SecurityGroups"])
        logger.info(f"Total Security Groups: {len(security_groups)}")
        return security_groups
    except ClientError as e:
        logger.error(f"Failed to retrieve security groups: {e}")
        return []

def remove_port_rule_from_security_group(security_group, port,client):
    group_id = security_group["GroupId"]
    ip_permissions = [
        rule for rule in security_group.get("IpPermissions", [])
        if rule.get("FromPort") == port and rule.get("ToPort") == port and rule.get("IpProtocol") == "tcp"
    ]
    
    if not ip_permissions:
        logger.info(f"No matching rules for port {port} in security group {group_id}.")
        return False
    
    try:
        client.revoke_security_group_ingress(GroupId=group_id, IpPermissions=ip_permissions)
        logger.info(f"Removed port {port} rule from security group {group_id}.")
        return True
    except ClientError as e:
        logger.error(f"Failed to remove port {port} from security group {group_id}: {e}")
        return False