package api

type RequestRetrierChecker struct { // we need it since we have request retry functionality on the client and we wouldnt want to recieve the same request twice an execute it
	executedRequests map[string]bool
}

// CheckRequest validates if the required header is present in the request
func (rh *RequestRetrierChecker) isCompleted(id string) bool {
    return rh.executedRequests[id]
}

// SetRequestHeader sets a custom header in the request
func (rh RequestRetrierChecker) MarkRequestAsCompleted(id string) {
	rh.executedRequests[id] = true;
}
