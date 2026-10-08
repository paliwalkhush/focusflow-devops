terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 7.0"
    }
  }

  required_version = ">= 1.6.0"
}

provider "google" {
  project = var.gcp_project_id
  region  = var.gcp_region
  zone    = var.gcp_zone
}

# ---------------------------------------------------------
# Artifact Registry
# ---------------------------------------------------------

resource "google_artifact_registry_repository" "focusflow" {
  location      = var.gcp_region
  repository_id = "focusflow"
  description   = "FocusFlow Docker images"
  format        = "DOCKER"
}

# ---------------------------------------------------------
# GKE Autopilot Cluster
# ---------------------------------------------------------

resource "google_container_cluster" "focusflow" {
  name     = var.gke_cluster_name
  location = var.gcp_region

  enable_autopilot = true

  deletion_protection = true
}