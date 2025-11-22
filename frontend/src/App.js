import React from 'react';
import './App.css';

// EC2 Components
import TerminateInstances from './components/EC2/TerminateInstances';
import StopInstances from './components/EC2/StopInstances';
import DeleteEC2KeyPairs from './components/EC2/DeleteEC2KeyPairs';

// S3 Components
import CleanupS3Objects from './components/S3/CleanupS3Objects';

// IAM Components
import DeleteIAMUser from './components/IAM/DeleteIAMUser';
import ManageIAMKeys from './components/IAM/ManageIAMKeys';

// Security Groups Components
import RemovePortFromSecurityGroups from './components/SecurityGroups/RemovePortFromSecurityGroups';
import DeleteUnusedSecurityGroups from './components/SecurityGroups/DeleteUnusedSecurityGroups';

// CloudWatch Components
import DeleteCloudWatchLogs from './components/CloudWatch/DeleteCloudWatchLogs';

// EBS Components
import CleanupEBSVolumes from './components/EBS/CleanupEBSVolumes';

// ECR Components
import CleanupECRRepos from './components/ECR/CleanupECRRepos';

// ECS Components
import DeleteECSClusters from './components/ECS/DeleteECSClusters';
import DeleteInactiveTaskDefinitions from './components/ECS/DeleteInactiveTaskDefinitions';

// EKS Components
import DeleteUnusedEKSClusters from './components/EKS/DeleteUnusedEKSClusters';

// RDS Components
import DeleteOldRDSSnapshots from './components/RDS/DeleteOldRDSSnapshots';

// Infrastructure Components
import DetectInfrastructureDrift from './components/Infrastructure/DetectInfrastructureDrift';

// Network Components
import CleanupIPs from './components/Network/CleanupIPs';
import CleanupAMIs from './components/Network/CleanupAMIs';

function App() {
  return (
    <div className="App">
      <h1>Manage AWS Resources</h1>
      <div className="component-container">
        <div className="component">
          <TerminateInstances />
        </div>
        <div className="component">
          <StopInstances />
        </div>
        <div className="component">
          <CleanupS3Objects />
        </div>
        <div className="component">
          <CleanupIPs />
        </div>
        <div className="component">
          <CleanupAMIs />
        </div>
        <div className="component">
          <DeleteCloudWatchLogs />
        </div>
        <div className="component">
          <DeleteIAMUser />
        </div>
        <div className="component">
          <RemovePortFromSecurityGroups />
        </div>
        <div className="component">
          <DetectInfrastructureDrift />
        </div>
        <div className="component">
          <CleanupEBSVolumes />
        </div>
        <div className="component">
          <CleanupECRRepos />
        </div>
        <div className="component">
          <DeleteECSClusters />
        </div>
        <div className="component">
          <DeleteInactiveTaskDefinitions />
        </div>
        <div className="component">
          <DeleteUnusedEKSClusters />
        </div>
        <div className="component">
          <DeleteEC2KeyPairs />
        </div>
        <div className="component">
          <DeleteOldRDSSnapshots />
        </div>
        <div className="component">
          <DeleteUnusedSecurityGroups />
        </div>
        <div className="component">
          <ManageIAMKeys />
        </div>
      </div>
    </div>
  );
}

export default App;
