package api

import (
	"encoding/json"
	"log"
	"net/http"
)

func addUserToProjectHandler() {}

func createProjectHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	var data struct {
		ProjectName string `json:"projectName"`
		CreatorName string `json:"creatorName"`
	}

	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		http.Error(w, "Bad request", http.StatusBadRequest)
		return
	}

	response :=  createProject(data.ProjectName, data.CreatorName)
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}


func deleteProjectHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	projectName := r.URL.Query().Get("projectName")
	if projectName == "" {
		http.Error(w, "Project name is required", http.StatusBadRequest)
		return
	}

	deleteProject(projectName)

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Project deleted successfully"))
}

func getProjectConnectInfoHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	// Parse projectName and username from query parameters
	projectName := r.URL.Query().Get("projectName")
	username := r.URL.Query().Get("username")
	if projectName == "" || username == "" {
		http.Error(w, "Project name and username are required", http.StatusBadRequest)
		return
	}

	// getProjectConnectInfo(projectName, username)

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Project connection info retrieved"))
}

func setUpK8sHelperApi() {
	http.HandleFunc("/projects/new", )
	http.HandleFunc("/projects/:id", )
	http.HandleFunc("/project/:id/containers/new",)
	http.HandleFunc("/projects/:id/containers/container_name") // patch, {payload: new_data} 
	http.HandleFunc("/projects/:id/containers/container_name") // delete
	http.HandleFunc("projects/:id/roles/new") // for post {}





	log.Println("Starting server on :8080...")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
