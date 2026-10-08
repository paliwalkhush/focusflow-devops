variable "gcp_project_id" {
  description = "Google Cloud project ID"
  type        = string
  default     = "focus-flow-508619"
}

variable "gcp_region" {
  description = "Google Cloud region"
  type        = string
  default     = "us-central1"
}

variable "gcp_zone" {
  description = "Google Cloud zone"
  type        = string
  default     = "us-central1-a"
}

variable "gke_cluster_name" {
  description = "GKE Autopilot cluster name"
  type        = string
  default     = "focusflow-cluster"
}