# AWS EC2 Management with Django

This Django project provides a simple web interface to manage AWS EC2 resources, allowing users to terminate EC2 instances based on tags and clean up unused Elastic IPs.

## Features

- **Terminate EC2 Instances:** Terminate EC2 instances by specifying a tag key and tag value.
- **Cleanup Unused Elastic IPs:** Clean up Elastic IPs that have not been associated with any resources for a specified retention period.

## Requirements

To run this project, you will need the following:

- Docker and Docker Compose
- AWS credentials with permissions to manage EC2 instances and Elastic IPs

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/aws-ec2-management.git
cd aws-ec2-management
```

### 2. Set AWS Credentials

Make sure to set your AWS credentials and region as environment variables. You can either do this by exporting them in your shell or by using a `.env` file.

### 3. Configure Environment Variables

Create a `.env` file in the root of the project and add the following:

```plaintext
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_DEFAULT_REGION=your_aws_region
```

### 4. Build and Run with Docker Compose

Run the following command to build and start the services:

```bash
docker-compose up --build
```

## Usage

### Terminate EC2 Instances

1. Enter the Tag Key and Tag Value of the EC2 instances you wish to terminate.
2. Submit the form to terminate the matching instances.

### Cleanup Elastic IPs

1. Enter the Retention Days (e.g., 7) for how long unassociated Elastic IPs should be kept.
2. Submit the form to release the unused Elastic IPs that have been unassociated for the specified retention period.
