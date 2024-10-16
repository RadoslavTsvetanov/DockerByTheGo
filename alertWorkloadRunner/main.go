package main

import (
	"fmt"
	"net/http"
)

func newHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "This is the /new endpoint!")
}

func main() {
	http.HandleFunc("/new", newHandler)

	fmt.Println("Server running on http://localhost:8080")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		fmt.Println("Error starting server:", err)
	}
}
