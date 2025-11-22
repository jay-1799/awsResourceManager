import { API_BASE_URL } from '../config/env';
import { getCookie } from '../utils/cookies';

const getHeaders = (includeCsrf = true) => {
  const headers = {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  };

  if (includeCsrf) {
    const csrfToken = getCookie('csrftoken');
    if (csrfToken) {
      headers['X-CSRFToken'] = csrfToken;
    }
  }

  return headers;
};

const handleResponse = async (response) => {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
};

export const apiCall = async (endpoint, body = null, includeCsrf = true) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const options = {
    method: 'POST',
    headers: getHeaders(includeCsrf),
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  return handleResponse(response);
};

// API Endpoints
export const api = {
  // EC2
  fetchInstances: (data) => apiCall('/fetch_instances/', data),
  terminateInstances: (data) => apiCall('/terminate_selected_instances/', data),
  stopInstances: (data) => apiCall('/stop_selected_instances/', data),
  deleteKeyPairs: () => apiCall('/delete_unused_key_pairs/'),

  // S3
  cleanupS3Objects: (data) => apiCall('/cleanup_s3_objects/', data),

  // IAM
  deleteIAMUser: (data) => apiCall('/delete_iam_user_complete/', data),
  manageIAMKeys: (data) => apiCall('/manage_iam_keys/', data, false),

  // Security Groups
  removePortFromSecurityGroups: (data) => apiCall('/remove_port_from_security_groups/', data),
  deleteUnusedSecurityGroups: (data) => apiCall('/delete_unused_security_groups/', data),

  // CloudWatch
  deleteCloudWatchLogs: (data) => apiCall('/delete_cloudwatch_logs/', data),

  // EBS
  cleanupEBSVolumes: (data) => apiCall('/cleanup_ebs_volumes/', data),

  // ECR
  cleanupECRRepos: (data) => apiCall('/cleanup_ecr_repos/', data),

  // ECS
  deleteECSClusters: () => apiCall('/delete_ecs_clusters/'),
  deleteInactiveTaskDefinitions: () => apiCall('/delete_inactive_task_definitions/'),

  // EKS
  deleteUnusedEKSClusters: () => apiCall('/delete_unused_eks_clusters/'),

  // RDS
  deleteRDSSnapshots: (data) => apiCall('/delete_rds_snapshots/', data),

  // Infrastructure
  detectInfrastructureDrift: (data) => apiCall('/detect_infrastructure_drift/', data),

  // Network
  cleanupElasticIPs: (data) => apiCall('/cleanup_elastic_ips/', data),
  cleanupAMIs: (data) => apiCall('/cleanup_amis/', data),
};
