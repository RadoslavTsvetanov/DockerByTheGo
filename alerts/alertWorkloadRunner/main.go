package main

import (
	"fmt"
	"net/http"
)


type  workloadInfo struct{ // dont know the whole strcuture so i will abstract it behind a strcut
	s3Url string
}

func fetch_workload_info() (workloadInfo, error) {
	return workloadInfo{},nil
}


func runWorkload(workloadInfo *workloadInfo){

}

func newHandler(w http.ResponseWriter, r *http.Request) {
	info, err := fetch_workload_info();
	if err!= nil {
        http.Error(w, "Failed to fetch workload info", http.StatusInternalServerError)
        return
    }
	runWorkload(&info)
	
	fmt.Fprintf(w, "This is the /new endpoint!")
}

func main() {
	http.HandleFunc("/new", newHandler)

	fmt.Println("Server running on http://localhost:8080")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		fmt.Println("Error starting server:", err)
	}
}
