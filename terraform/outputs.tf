output "artifact_registry_repository" {
  description = "FocusFlow Artifact Registry repository"
  value       = google_artifact_registry_repository.focusflow.name
}

output "gke_cluster_name" {
  description = "FocusFlow GKE cluster"
  value       = google_container_cluster.focusflow.name
}

output "gke_cluster_location" {
  description = "GKE cluster location"
  value       = google_container_cluster.focusflow.location
}